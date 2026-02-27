# tests/test_graphs.py (pytest-версия)
from algoslib.graphs import *

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

def test_weighted_graph_creation():
    g = Weighted_Graph()
    assert isinstance(g, Weighted_Graph)

def test_weighted_add_edge():
    g = Weighted_Graph()
    g.add_edge(0, 1, 0.5)
    neighbors = g.get_neighbors(0)
    assert len(neighbors) == 1
    assert neighbors[0][0] == 1       # сосед
    assert neighbors[0][1] == 0.5     # вес


def test_dijkstra_simple():
    """Простой линейный граф: 0 --1.0--> 1 --2.0--> 2"""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)
    
    steps = dijkstra(g, 0)
    
    assert len(steps) == 3
    assert set(steps[-1].visited) == {0, 1, 2}
    
    # Проверка итоговых расстояний
    final_distances = steps[-1].distances
    assert final_distances[0] == 0.0
    assert final_distances[1] == 1.0
    assert final_distances[2] == 3.0


def test_dijkstra_step_type():
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    steps = dijkstra(g, 0)
    assert all(isinstance(s, Dijkstra_Step) for s in steps)

def test_dijkstra_shortest_path():
    """
    Граф с выбором пути:
    0 --1.0--> 1 --1.0--> 2  
    0 --5.0--> 2            
    Дейкстра должен выбрать путь через вершину 1.
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    g.add_edge(0, 2, 5.0)
    
    steps = dijkstra(g, 0)
    final_distances = steps[-1].distances
    
    assert final_distances[2] == 2.0  


def test_dijkstra_disconnected():
    """Граф с недостижимой вершиной."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(2, 3, 1.0)  # Отдельный компонент
    
    steps = dijkstra(g, 0)
    final_distances = steps[-1].distances
    
    assert final_distances[0] == 0.0
    assert final_distances[1] == 1.0
    # Вершины 2 и 3 недостижимы (бесконечность)
    assert final_distances[2] == float('inf')
    assert final_distances[3] == float('inf')


def test_dijkstra_float_weights():
    """Проверка работы с дробными весами."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 0.1)
    g.add_edge(1, 2, 0.2)
    
    steps = dijkstra(g, 0)
    final_distances = steps[-1].distances
    
    assert abs(final_distances[1] - 0.1) < 1e-9
    assert abs(final_distances[2] - 0.3) < 1e-9


def test_dijkstra_history_updates():
    """Проверка, что история шагов показывает изменение расстояний."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    
    steps = dijkstra(g, 0)
    
    # На первом шаге обработана вершина 0
    assert steps[0].current_node == 0
    assert steps[0].distances[0] == 0.0
    
    # Расстояние до 1 должно обновиться на раннем этапе
    found_update = False
    for step in steps:
        if step.distances.get(1, float('inf')) == 1.0:
            found_update = True
            break
    assert found_update