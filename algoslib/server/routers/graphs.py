import math
import traceback

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


class BFSRequest(BaseModel):
    edges: list[list[int]]
    start_node: int


class DijkstraRequest(BaseModel):
    edges: list[list[float]]
    start_node: int


class BellmanFordRequest(BaseModel):
    edges: list[list[float]]
    start_node: int


@router.post("/bfs")
async def run_bfs(req: BFSRequest):
    try:
        from algoslib.graphs import Graph, bfs
        graph = Graph()
        nodes = set()
        for edge in req.edges:
            graph.add_edge(edge[0], edge[1])
            nodes.add(edge[0])
            nodes.add(edge[1])

        steps = bfs(graph, req.start_node)

        result_steps = []
        for step in steps:
            result_steps.append({
                "current_node": int(step.current_node),
                "visited": [int(x) for x in step.visited],
                "queue": [int(x) for x in step.queue],
            })

        return {
            "steps": result_steps,
            "edges": req.edges,
            "nodes": sorted(nodes),
        }
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
                detail="Dijkstra не доступен — пересоберите sub_graphs: python setup.py build_ext --inplace",
            )
        graph = Weighted_Graph()
        nodes = set()
        for edge in req.edges:
            u, v, w = int(edge[0]), int(edge[1]), edge[2]
            graph.add_edge(u, v, w)
            nodes.add(u)
            nodes.add(v)

        steps = dijkstra(graph, req.start_node)

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
            "edges": req.edges,
            "nodes": sorted(nodes),
        }
    except HTTPException:
        raise
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
                detail="Bellman-Ford не доступен — пересоберите sub_graphs",
            )
        graph = Weighted_Graph()
        nodes = set()
        for edge in req.edges:
            u, v, w = int(edge[0]), int(edge[1]), edge[2]
            graph.add_edge(u, v, w)
            nodes.add(u)
            nodes.add(v)

        steps = bellman_ford(graph, req.start_node)

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
            "edges": req.edges,
            "nodes": sorted(nodes),
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})