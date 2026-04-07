import math
import traceback

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


class BFSRequest(BaseModel):
    edges: list[list[str]]
    start_node: str


class DijkstraRequest(BaseModel):
    edges: list[list[str]]
    start_node: str


class BellmanFordRequest(BaseModel):
    edges: list[list[str]]
    start_node: str


class KruskalRequest(BaseModel):
    edges: list[list[str]]


def _normalize_label(value: str) -> str:
    label = str(value).strip()
    if not label:
        raise ValueError("Название ноды не может быть пустым.")
    if len(label) > 3:
        raise ValueError("Название ноды должно быть не длиннее 3 символов.")
    return label


def _build_label_maps(edges: list[list[str]], start_node: str) -> tuple[dict[str, int], dict[str, str], str]:
    label_to_id: dict[str, int] = {}

    for edge in edges:
        if len(edge) < 2:
            raise ValueError("Каждое ребро должно содержать как минимум две ноды.")
        for raw_label in edge[:2]:
            label = _normalize_label(raw_label)
            if label not in label_to_id:
                label_to_id[label] = len(label_to_id)

    start_label = _normalize_label(start_node)
    if start_label not in label_to_id:
        raise ValueError("Стартовая нода отсутствует в графе.")

    node_labels = {str(node_id): label for label, node_id in label_to_id.items()}
    return label_to_id, node_labels, start_label


def _build_label_maps_no_start(edges: list[list[str]]) -> tuple[dict[str, int], dict[str, str]]:
    label_to_id: dict[str, int] = {}

    for edge in edges:
        if len(edge) < 2:
            raise ValueError("Каждое ребро должно содержать как минимум две ноды.")
        for raw_label in edge[:2]:
            label = _normalize_label(raw_label)
            if label not in label_to_id:
                label_to_id[label] = len(label_to_id)

    node_labels = {str(node_id): label for label, node_id in label_to_id.items()}
    return label_to_id, node_labels


def _parse_unweighted_edges(edges: list[list[str]], label_to_id: dict[str, int]) -> list[list[int]]:
    parsed_edges: list[list[int]] = []
    for edge in edges:
        if len(edge) < 2:
            raise ValueError("Каждое ребро должно содержать две ноды.")
        u = label_to_id[_normalize_label(edge[0])]
        v = label_to_id[_normalize_label(edge[1])]
        parsed_edges.append([u, v])
    return parsed_edges


def _parse_weighted_edges(edges: list[list[str]], label_to_id: dict[str, int]) -> list[list[int | float]]:
    parsed_edges: list[list[int | float]] = []
    for edge in edges:
        if len(edge) < 3:
            raise ValueError("Каждое взвешенное ребро должно содержать две ноды и вес.")
        u = label_to_id[_normalize_label(edge[0])]
        v = label_to_id[_normalize_label(edge[1])]
        try:
            w = float(edge[2])
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Некорректный вес ребра: {edge[2]}") from exc
        parsed_edges.append([u, v, w])
    return parsed_edges


@router.post("/bfs")
async def run_bfs(req: BFSRequest):
    try:
        from algoslib.graphs import Graph, bfs

        label_to_id, node_labels, start_label = _build_label_maps(req.edges, req.start_node)
        parsed_edges = _parse_unweighted_edges(req.edges, label_to_id)

        graph = Graph()
        nodes = set()
        for u, v in parsed_edges:
            graph.add_edge(u, v)
            nodes.add(u)
            nodes.add(v)

        steps = bfs(graph, label_to_id[start_label])

        result_steps = []
        for step in steps:
            result_steps.append({
                "current_node": int(step.current_node),
                "visited": [int(x) for x in step.visited],
                "queue": [int(x) for x in step.queue],
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/dijkstra")
async def run_dijkstra(req: DijkstraRequest):
    try:
        from algoslib.graphs import Weighted_Graph, dijkstra

        if Weighted_Graph is None:
            raise HTTPException(
                status_code=501,
                detail="Dijkstra недоступен. Пересоберите sub_graphs: python setup.py build_ext --inplace",
            )

        label_to_id, node_labels, start_label = _build_label_maps(req.edges, req.start_node)
        parsed_edges = _parse_weighted_edges(req.edges, label_to_id)

        graph = Weighted_Graph()
        nodes = set()
        for u, v, w in parsed_edges:
            graph.add_edge(u, v, w)
            nodes.add(u)
            nodes.add(v)

        steps = dijkstra(graph, label_to_id[start_label])

        result_steps = []
        for step in steps:
            distances = {}
            for node, dist in step.distances.items():
                distances[str(node)] = None if math.isinf(dist) else float(dist)
            result_steps.append({
                "current_node": int(step.current_node),
                "distances": distances,
                "visited": [int(x) for x in step.visited],
                "queue": [int(x) for x in step.queue],
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/bellman_ford")
async def run_bellman_ford(req: BellmanFordRequest):
    try:
        from algoslib.graphs import Weighted_Graph, bellman_ford

        if bellman_ford is None:
            raise HTTPException(
                status_code=501,
                detail="Bellman-Ford недоступен. Пересоберите sub_graphs.",
            )

        label_to_id, node_labels, start_label = _build_label_maps(req.edges, req.start_node)
        parsed_edges = _parse_weighted_edges(req.edges, label_to_id)

        graph = Weighted_Graph()
        nodes = set()
        for u, v, w in parsed_edges:
            graph.add_edge(u, v, w)
            nodes.add(u)
            nodes.add(v)

        steps = bellman_ford(graph, label_to_id[start_label])

        result_steps = []
        for step in steps:
            distances = {}
            for node, dist in step.distances.items():
                distances[str(node)] = None if math.isinf(dist) else float(dist)
            result_steps.append({
                "iteration": int(step.iteration),
                "edge_from": int(step.edge_from),
                "edge_to": int(step.edge_to),
                "relaxed": bool(step.relaxed),
                "distances": distances,
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/kruskal")
async def run_kruskal(req: KruskalRequest):
    try:
        from algoslib.graphs import Weighted_Graph, kruskal

        if kruskal is None:
            raise HTTPException(
                status_code=501,
                detail="Kruskal недоступен. Пересоберите sub_graphs.",
            )

        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_weighted_edges(req.edges, label_to_id)

        graph = Weighted_Graph()
        nodes = set()
        for u, v, w in parsed_edges:
            graph.add_edge(u, v, w)
            nodes.add(u)
            nodes.add(v)

        steps = kruskal(graph)

        result_steps = []
        for step in steps:
            mst_edges = []
            for e in step.mst_edges:
                mst_edges.append([int(e[0]), int(e[1]), float(e[2])])
            result_steps.append({
                "edge_from": int(step.edge_from),
                "edge_to": int(step.edge_to),
                "edge_weight": float(step.edge_weight),
                "accepted": bool(step.accepted),
                "mst_edges": mst_edges,
                "total_weight": float(step.total_weight),
                "components": {str(k): int(v) for k, v in step.components.items()},
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
