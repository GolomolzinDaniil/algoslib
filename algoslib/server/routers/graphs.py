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

class FordFulkersonRequest(BaseModel):
    edges: list[list[str]]
    start_node: str
    sink: str

class EdmondsKarpRequest(BaseModel):
    edges: list[list[str]]
    start_node: str
    sink: str

class TarjanRequest(BaseModel):
    edges: list[list[str]] 

class KosarajuRequest(BaseModel):
    edges: list[list[str]]


class StalinSortRequest(BaseModel):
    edges: list[list[str]]


class HierholzerRequest(BaseModel):
    edges: list[list[str]]


class HamiltonianRequest(BaseModel):
    edges: list[list[str]]
    start_node: str
    find_cycle: bool = False


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


@router.post("/stalin_sort")
async def run_stalin_sort(req: StalinSortRequest):
    try:
        from algoslib.graphs import Graph, stalin_sort

        if stalin_sort is None:
            raise HTTPException(
                status_code=501,
                detail="Stalin Sort недоступен. Пересоберите sub_graphs.",
            )

        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_unweighted_edges(req.edges, label_to_id)

        graph = Graph()
        nodes = set()
        for u, v in parsed_edges:
            graph.add_edge(u, v)
            nodes.add(u)
            nodes.add(v)

        steps = stalin_sort(graph)

        result_steps = []
        for step in steps:
            result_steps.append({
                "current_node": int(step.current_node),
                "accepted": bool(step.accepted),
                "conflict_with": int(step.conflict_with),
                "clique": [int(x) for x in step.clique],
                "exiled": [int(x) for x in step.exiled],
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
    
@router.post("/ford_fulkerson")
async def run_ford_fulkerson(req: FordFulkersonRequest):
    try:
        from algoslib.graphs import Flow_Graph, ford_fulkerson
        if ford_fulkerson is None:
            raise HTTPException(status_code=501, detail="Ford-Fulkerson не доступен")
        
        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_weighted_edges(req.edges, label_to_id)

        graph = Flow_Graph()
        nodes = set()
        for u, v, cap in parsed_edges:
            graph.add_edge(u, v, cap)
            nodes.add(u)
            nodes.add(v)

        source_id = label_to_id.get(req.start_node)
        sink_id = label_to_id.get(req.sink)
        
        if source_id is None:
            raise HTTPException(status_code=400, detail=f"Источник '{req.start_node}' не найден в графе")
        if sink_id is None:
            raise HTTPException(status_code=400, detail=f"Сток '{req.sink}' не найден в графе")

        result = ford_fulkerson(graph, source_id, sink_id)

        result_steps = []
        for step in result.history:
            augmenting_path = [node_labels.get(x, str(x)) for x in step.augmenting_path]
            residual = {}
            for u, targets in step.residual_capacities.items():
                u_label = node_labels.get(u, str(u))
                residual[u_label] = {
                    node_labels.get(v, str(v)): float(cap) 
                    for v, cap in targets.items()
                }
            
            result_steps.append({
                "iteration": int(step.iteration),
                "augmenting_path": augmenting_path,
                "flow_increase": float(step.flow_increase),
                "total_flow": float(step.total_flow),
                "residual_capacities": residual,
            })

        flow_dict = {}
        for u, targets in result.flow.items():
            u_label = node_labels.get(u, str(u))
            flow_dict[u_label] = {
                node_labels.get(v, str(v)): float(cap) 
                for v, cap in targets.items() 
                if abs(cap) > 1e-9
            }

        return {
            "steps": result_steps,
            "max_flow": float(result.max_flow),
            "flow": flow_dict,
            "edges": parsed_edges, 
            "nodes": sorted(nodes), 
            "node_labels": node_labels, 
            "source": source_id,
            "sink": sink_id, 
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "error_type": type(e).__name__}
        )


@router.post("/edmonds_karp")
async def run_edmonds_karp(req: EdmondsKarpRequest):
    try:
        from algoslib.graphs import Flow_Graph, edmonds_karp
        if edmonds_karp is None:
            raise HTTPException(status_code=501, detail="Edmonds-Karp не доступен")

        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_weighted_edges(req.edges, label_to_id)

        graph = Flow_Graph()
        nodes = set()
        for u, v, cap in parsed_edges:
            graph.add_edge(u, v, cap)
            nodes.add(u)
            nodes.add(v)

        source_id = label_to_id.get(req.start_node)
        sink_id = label_to_id.get(req.sink)
        
        if source_id is None:
            raise HTTPException(status_code=400, detail=f"Источник '{req.start_node}' не найден")
        if sink_id is None:
            raise HTTPException(status_code=400, detail=f"Сток '{req.sink}' не найден")

        result = edmonds_karp(graph, source_id, sink_id)

        result_steps = []
        for step in result.history:
            augmenting_path = [node_labels.get(x, str(x)) for x in step.augmenting_path]
            
            residual = {}
            for u, targets in step.residual_capacities.items():
                u_label = node_labels.get(u, str(u))
                residual[u_label] = {
                    node_labels.get(v, str(v)): float(cap) 
                    for v, cap in targets.items()
                }
            
            result_steps.append({
                "iteration": int(step.iteration),
                "augmenting_path": augmenting_path,
                "flow_increase": float(step.flow_increase),
                "total_flow": float(step.total_flow),
                "residual_capacities": residual,
            })

        flow_dict = {}
        for u, targets in result.flow.items():
            u_label = node_labels.get(u, str(u))
            flow_dict[u_label] = {
                node_labels.get(v, str(v)): float(cap) 
                for v, cap in targets.items() 
                if abs(cap) > 1e-9
            }

        return {
            "steps": result_steps,
            "max_flow": float(result.max_flow),
            "flow": flow_dict,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
            "source": source_id,
            "sink": sink_id,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "error_type": type(e).__name__}
        )
    
@router.post("/hierholzer")
async def run_hierholzer(req: HierholzerRequest):
    try:
        from algoslib.graphs import Graph, hierholzer

        if hierholzer is None:
            raise HTTPException(
                status_code=501,
                detail="Hierholzer недоступен. Пересоберите sub_graphs.",
            )

        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_unweighted_edges(req.edges, label_to_id)

        graph = Graph()
        nodes = set()
        for u, v in parsed_edges:
            graph.add_edge(u, v)
            nodes.add(u)
            nodes.add(v)

        steps = hierholzer(graph)

        result_steps = []
        for step in steps:
            result_steps.append({
                "current_node": int(step.current_node),
                "action": step.action,
                "stack": [int(x) for x in step.stack],
                "circuit": [int(x) for x in step.circuit],
                "remaining_edges": [[int(e[0]), int(e[1])] for e in step.remaining_edges],
                "euler_exists": bool(step.euler_exists),
                "is_circuit": bool(step.is_circuit),
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


@router.post("/hamiltonian")
async def run_hamiltonian(req: HamiltonianRequest):
    try:
        from algoslib.graphs import Graph, hamiltonian_backtracking

        if hamiltonian_backtracking is None:
            raise HTTPException(
                status_code=501,
                detail="Hamiltonian Backtracking недоступен. Пересоберите sub_graphs.",
            )

        label_to_id, node_labels, start_label = _build_label_maps(req.edges, req.start_node)
        parsed_edges = _parse_unweighted_edges(req.edges, label_to_id)

        graph = Graph()
        nodes = set()
        for u, v in parsed_edges:
            graph.add_edge(u, v)
            nodes.add(u)
            nodes.add(v)

        steps = hamiltonian_backtracking(
            graph,
            label_to_id[start_label],
            bool(req.find_cycle),
        )

        result_steps = []
        for step in steps:
            result_steps.append({
                "current_node": int(step.current_node),
                "action": step.action,
                "path": [int(x) for x in step.path],
                "visited": [int(x) for x in step.visited],
                "depth": int(step.depth),
                "found": bool(step.found),
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
            "find_cycle": bool(req.find_cycle),
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/tarjan")
async def run_tarjan(req: TarjanRequest):
    try:
        # Импортируем OrientedGraph и функцию алгоритма
        from algoslib.graphs import OrientedGraph, tarjan_scc

        if tarjan_scc is None:
            raise HTTPException(status_code=501, detail="Tarjan SCC недоступен. Пересоберите sub_graphs.")

        # Парсим рёбра и маппинг меток
        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_unweighted_edges(req.edges, label_to_id)

        # Создаем ориентированный граф
        graph = OrientedGraph()
        
        # ВАЖНО: Собираем уникальные вершины из списка рёбер, а не из graph.adjacency_list
        nodes = set()
        for u, v in parsed_edges:
            graph.add_edge(u, v)  # Добавляем направленное ребро u -> v
            nodes.add(u)
            nodes.add(v)

        # Запускаем алгоритм
        steps = tarjan_scc(graph)

        # Формируем ответ
        result_steps = []
        for step in steps:
            result_steps.append({
                "current_node": int(step.current_node) if step.current_node != -1 else None,
                "stack": [int(x) for x in step.stack],
                "index_map": {str(k): int(v) for k, v in step.index_map.items()},
                "lowlink_map": {str(k): int(v) for k, v in step.lowlink_map.items()},
                "on_stack_nodes": [int(x) for x in step.on_stack_nodes],
                "edge_from": int(step.edge_from) if step.edge_from != -1 else None,
                "edge_to": int(step.edge_to) if step.edge_to != -1 else None,
                "edge_type": step.edge_type,
                "completed_sccs": [[int(x) for x in scc] for scc in step.completed_sccs],
                "current_scc": [int(x) for x in step.current_scc],
                "action": step.action,
                "index_counter": int(step.index_counter),
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),  # Вершины берутся из набора nodes, который мы собрали вручную
            "node_labels": node_labels,
            "algorithm": "tarjan",
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
    
    
@router.post("/kosaraju")
async def run_kosaraju(req: KosarajuRequest):
    try:
        from algoslib.graphs import OrientedGraph, kosaraju_scc

        if kosaraju_scc is None:
            raise HTTPException(status_code=501, detail="Kosaraju недоступен. Пересоберите sub_graphs.")

        label_to_id, node_labels = _build_label_maps_no_start(req.edges)
        parsed_edges = _parse_unweighted_edges(req.edges, label_to_id)

        graph = OrientedGraph()
        nodes = set()
        for u, v in parsed_edges:
            graph.add_edge(u, v)  # Направленное ребро
            nodes.add(u)
            nodes.add(v)

        steps = kosaraju_scc(graph)

        result_steps = []
        for step in steps:
            result_steps.append({
                "phase": int(step.phase),
                "current_node": int(step.current_node) if step.current_node != -1 else None,
                "stack": [int(x) for x in step.stack],
                "finish_order": [int(x) for x in step.finish_order],
                "processing_order": [int(x) for x in step.processing_order],
                "edge_from": int(step.edge_from) if step.edge_from != -1 else None,
                "edge_to": int(step.edge_to) if step.edge_to != -1 else None,
                "completed_sccs": [[int(x) for x in scc] for scc in step.completed_sccs],
                "current_scc": [int(x) for x in step.current_scc],
                "action": step.action,
                "is_transposed_edge": bool(step.is_transposed_edge),
            })

        return {
            "steps": result_steps,
            "edges": parsed_edges,
            "nodes": sorted(nodes),
            "node_labels": node_labels,
            "algorithm": "kosaraju",
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})