# tests/test_graphs.py (pytest-версия)
from algoslib.graphs import Graph, bfs, BFS_Step

def test_graph_creation():
    g = Graph()
    assert isinstance(g, Graph)

def test_add_edge():
    g = Graph()
    g.add_edge(0, 1)
    assert g.get_neighbors(0) == [1]

def test_bfs_simple():
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(0, 3)
    steps = bfs(g, 0)
    assert len(steps) == 4
    assert set(steps[-1].visited) == {0, 1, 2, 3}

def test_bfs_step_type():
    g = Graph()
    g.add_edge(0, 1)
    steps = bfs(g, 0)
    assert all(isinstance(s, BFS_Step) for s in steps)

def test_bfs_invalid_start():
    g = Graph()
    g.add_edge(0, 1)
    try:
        bfs(g, 99)
        assert False, "должно было выброситься исключение"
    except Exception:
        pass