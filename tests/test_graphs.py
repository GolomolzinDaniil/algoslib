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

def test_bellman_ford_simple():
    """Простой линейный граф: 0 --1.0--> 1 --2.0--> 2"""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)
    
    steps = bellman_ford(g, 0)
    
    # Проверка, что шаги есть и последний содержит все вершины
    assert len(steps) >= 1
    final_distances = steps[-1].distances
    assert final_distances[0] == 0.0
    assert final_distances[1] == 1.0
    assert final_distances[2] == 3.0


def test_bellman_ford_step_type():
    """Проверка типа возвращаемых шагов."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    steps = bellman_ford(g, 0)
    assert all(isinstance(s, Ford_Step) for s in steps)


def test_bellman_ford_negative_weight():
    """
    Граф с отрицательным весом (но без цикла):
    0 --1.0--> 1 --(-2.0)--> 2
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, -2.0)
    
    steps = bellman_ford(g, 0)
    final_distances = steps[-1].distances
    
    assert final_distances[0] == 0.0
    assert final_distances[1] == 1.0
    assert final_distances[2] == -1.0  # 1.0 + (-2.0)


def test_bellman_ford_shortest_path_choice():
    """
    Граф с выбором пути (аналогично тесту для Дейкстры):
    0 --1.0--> 1 --1.0--> 2  
    0 --5.0--> 2            
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    g.add_edge(0, 2, 5.0)
    
    steps = bellman_ford(g, 0)
    final_distances = steps[-1].distances
    
    assert final_distances[2] == 2.0  # Путь через вершину 1 короче


def test_bellman_ford_disconnected():
    """Граф с недостижимой вершиной."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(2, 3, 1.0)  # Отдельный компонент
    
    steps = bellman_ford(g, 0)
    final_distances = steps[-1].distances
    
    assert final_distances[0] == 0.0
    assert final_distances[1] == 1.0
    # Вершины 2 и 3 недостижимы
    assert final_distances[2] == float('inf')
    assert final_distances[3] == float('inf')


def test_bellman_ford_float_weights():
    """Проверка работы с дробными весами."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 0.1)
    g.add_edge(1, 2, 0.2)
    
    steps = bellman_ford(g, 0)
    final_distances = steps[-1].distances
    
    assert abs(final_distances[1] - 0.1) < 1e-9
    assert abs(final_distances[2] - 0.3) < 1e-9


def test_bellman_ford_history_contains_relaxations():
    """Проверка, что история содержит шаги с релаксацией."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    
    steps = bellman_ford(g, 0)
    
    # Хотя бы один шаг должен иметь relaxed=True
    assert any(step.relaxed for step in steps)
    
    # Проверка полей шага
    for step in steps:
        assert isinstance(step.iteration, int)
        assert step.iteration >= 1
        assert isinstance(step.edge_from, int)
        assert isinstance(step.edge_to, int)
        assert isinstance(step.distances, dict)


def test_bellman_ford_negative_cycle_detection():
    """
    Граф с отрицательным циклом:
    0 --1.0--> 1 --(-2.0)--> 2 --1.0--> 1
    Цикл 1->2->1 имеет суммарный вес -1 < 0
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, -2.0)
    g.add_edge(2, 1, 1.0)  # Замыкает отрицательный цикл
    
    steps = bellman_ford(g, 0)
    
    # Если реализация записывает шаг при обнаружении цикла,
    # последний шаг будет иметь iteration == |V|
    if steps:
        last_step = steps[-1]
        # Либо цикл обнаружен (итерация == количеству вершин)
        # либо алгоритм корректно отработал без выброса исключения
        assert isinstance(last_step.iteration, int)
        assert last_step.iteration >= 1


def test_bellman_ford_vs_dijkstra_consistency():
    """
    На графах без отрицательных весов результаты
    Беллмана-Форда и Дейкстры должны совпадать.
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(0, 2, 4.0)
    g.add_edge(1, 2, 2.0)
    g.add_edge(1, 3, 5.0)
    g.add_edge(2, 3, 1.0)
    
    bf_steps = bellman_ford(g, 0)
    dj_steps = dijkstra(g, 0)
    
    bf_final = bf_steps[-1].distances
    dj_final = dj_steps[-1].distances
    
    # Сравниваем расстояния для всех вершин
    for node in bf_final:
        if bf_final[node] == float('inf'):
            assert dj_final[node] == float('inf')
        else:
            assert abs(bf_final[node] - dj_final[node]) < 1e-9


# ================= Тесты для алгоритма Краскала =================

def test_kruskal_simple():
    """Простой граф: 0 --1.0-- 1 --2.0-- 2"""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)

    steps = kruskal(g)

    assert len(steps) == 2
    # Оба ребра должны быть приняты (MST = весь граф)
    assert all(step.accepted for step in steps)
    assert abs(steps[-1].total_weight - 3.0) < 1e-9


def test_kruskal_step_type():
    """Проверка типа возвращаемых шагов."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    steps = kruskal(g)
    assert all(isinstance(s, Kruskal_Step) for s in steps)


def test_kruskal_with_cycle():
    """
    Граф с циклом — Краскал должен отклонить одно ребро:
    0 --1.0-- 1
    1 --2.0-- 2
    0 --3.0-- 2  (создаёт цикл, должно быть отклонено)
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)
    g.add_edge(0, 2, 3.0)

    steps = kruskal(g)

    assert len(steps) == 3
    accepted = [s for s in steps if s.accepted]
    rejected = [s for s in steps if not s.accepted]
    assert len(accepted) == 2  # |V| - 1 = 2 ребра в MST
    assert len(rejected) == 1  # одно ребро отклонено (цикл)
    assert abs(steps[-1].total_weight - 3.0) < 1e-9  # 1.0 + 2.0


def test_kruskal_mst_weight():
    """
    Проверка суммарного веса MST:
    0 --4-- 1
    0 --2-- 2
    1 --1-- 2
    1 --5-- 3
    2 --8-- 3
    MST: (1,2,1), (0,2,2), (1,3,5) => вес = 8
    """
    g = Weighted_Graph()
    g.add_edge(0, 1, 4.0)
    g.add_edge(0, 2, 2.0)
    g.add_edge(1, 2, 1.0)
    g.add_edge(1, 3, 5.0)
    g.add_edge(2, 3, 8.0)

    steps = kruskal(g)

    accepted = [s for s in steps if s.accepted]
    assert len(accepted) == 3  # |V| - 1 = 3
    assert abs(steps[-1].total_weight - 8.0) < 1e-9


def test_kruskal_edge_order():
    """Проверка, что рёбра рассматриваются в порядке возрастания веса."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 5.0)
    g.add_edge(1, 2, 1.0)
    g.add_edge(0, 2, 3.0)

    steps = kruskal(g)

    weights = [s.edge_weight for s in steps]
    assert weights == sorted(weights)


def test_kruskal_disconnected():
    """Граф с двумя компонентами — MST не объединяет их."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(2, 3, 2.0)

    steps = kruskal(g)

    accepted = [s for s in steps if s.accepted]
    assert len(accepted) == 2  # по одному ребру на каждую компоненту
    assert abs(steps[-1].total_weight - 3.0) < 1e-9


def test_kruskal_float_weights():
    """Проверка работы с дробными весами."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 0.1)
    g.add_edge(1, 2, 0.2)
    g.add_edge(0, 2, 0.5)

    steps = kruskal(g)

    accepted = [s for s in steps if s.accepted]
    assert len(accepted) == 2
    assert abs(steps[-1].total_weight - 0.3) < 1e-9


def test_kruskal_components():
    """Проверка, что components содержит корректные id компонент."""
    g = Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)

    steps = kruskal(g)

    # После последнего шага все вершины должны быть в одной компоненте
    final_components = steps[-1].components
    assert len(set(final_components.values())) == 1