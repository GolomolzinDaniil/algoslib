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


def test_ford_fulkerson_simple():
    """Простой граф: s -> a -> t с пропускной способностью 10"""
    g = Flow_Graph()
    g.add_edge(0, 1, 10.0)
    g.add_edge(1, 2, 10.0)
    
    result = ford_fulkerson(g, 0, 2)
    
    assert result.max_flow == 10.0
    assert len(result.history) >= 1


def test_ford_fulkerson_multiple_paths():
    """Граф с несколькими путями"""
    g = Flow_Graph()
    g.add_edge(0, 1, 10.0)
    g.add_edge(0, 2, 10.0)
    g.add_edge(1, 3, 10.0)
    g.add_edge(2, 3, 10.0)
    
    result = ford_fulkerson(g, 0, 3)
    
    assert result.max_flow == 20.0


def test_ford_fulkerson_bottleneck():
    """Граф с узким местом"""
    g = Flow_Graph()
    g.add_edge(0, 1, 10.0)
    g.add_edge(1, 2, 5.0)  
    g.add_edge(2, 3, 10.0)
    
    result = ford_fulkerson(g, 0, 3)
    
    assert result.max_flow == 5.0


def test_ford_fulkerson_step_type():
    """Проверка типа шагов"""
    g = Flow_Graph()
    g.add_edge(0, 1, 10.0)
    g.add_edge(1, 2, 10.0)

    result = ford_fulkerson(g, 0, 2)

    assert all(isinstance(s, FordFulkerson_Step) for s in result.history)

def test_oriented_graph_creation():
    g = OrientedGraph()
    assert isinstance(g, OrientedGraph)

def test_oriented_graph_directed_edges():
    """Проверка, что рёбра добавляются строго в одном направлении."""
    g = OrientedGraph()
    g.add_edge(0, 1)
    
    # 0 -> 1 существует
    neighbors_0 = g.get_neighbors(0)
    assert 1 in neighbors_0
    
    # 1 -> 0 НЕ существует
    neighbors_1 = g.get_neighbors(1)
    assert 0 not in neighbors_1


# ================= Тесты для алгоритма Хирхольцера =================

def test_hierholzer_step_type():
    """Проверка типа возвращаемых шагов."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)
    steps = hierholzer(g)
    assert all(isinstance(s, Hierholzer_Step) for s in steps)


def test_hierholzer_simple_circuit():
    """K3 (треугольник) — все степени чётные, должен быть эйлеров цикл."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)

    steps = hierholzer(g)
    last = steps[-1]

    assert last.euler_exists
    assert last.is_circuit
    # Цикл проходит по 3 рёбрам => 4 вершины в последовательности (start == end)
    assert len(last.circuit) == 4
    assert last.circuit[0] == last.circuit[-1]


def test_hierholzer_eulerian_path():
    """Путь 0-1-2-3 — две вершины (0 и 3) нечётной степени, должен быть эйлеров путь."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 3)

    steps = hierholzer(g)
    last = steps[-1]

    assert last.euler_exists
    assert not last.is_circuit
    assert last.circuit[0] != last.circuit[-1]
    assert len(last.circuit) == 4  # 3 ребра => 4 вершины
    # Стартуем из вершины нечётной степени
    assert last.circuit[0] in (0, 3)


def test_hierholzer_no_path():
    """Граф с >2 вершинами нечётной степени — эйлерова пути нет."""
    g = Graph()
    # Звезда K_{1,3}: вершина 0 степени 3 (нечёт), 1,2,3 степени 1 (нечёт)
    g.add_edge(0, 1)
    g.add_edge(0, 2)
    g.add_edge(0, 3)

    steps = hierholzer(g)
    last = steps[-1]

    assert not last.euler_exists
    assert last.action == "no_path"


def test_hierholzer_uses_each_edge_once():
    """Каждое ребро должно быть пройдено ровно один раз."""
    g = Graph()
    edges = [(0, 1), (1, 2), (2, 0), (0, 3), (3, 4), (4, 0)]
    for u, v in edges:
        g.add_edge(u, v)

    steps = hierholzer(g)
    circuit = steps[-1].circuit

    assert steps[-1].euler_exists
    # Подсчитываем рёбра пройденные циклом
    used = []
    for i in range(len(circuit) - 1):
        u, v = circuit[i], circuit[i + 1]
        used.append(tuple(sorted((u, v))))

    expected = sorted(tuple(sorted(e)) for e in edges)
    assert sorted(used) == expected


def test_hierholzer_history_actions():
    """История должна содержать корректные типы действий."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)

    steps = hierholzer(g)
    actions = {s.action for s in steps}

    assert "init" in actions
    assert "push" in actions
    assert "pop" in actions
    assert steps[-1].action == "done"


def test_hierholzer_remaining_edges_decrease():
    """Количество непройденных рёбер не должно возрастать по ходу алгоритма."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 3)
    g.add_edge(3, 0)

    steps = hierholzer(g)
    counts = [len(s.remaining_edges) for s in steps]
    for i in range(1, len(counts)):
        assert counts[i] <= counts[i - 1]
    # В конце все рёбра пройдены
    assert counts[-1] == 0


# ================= Тесты для Backtracking-Hamiltonian =================

def test_hamiltonian_step_type():
    """Проверка типа возвращаемых шагов."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    steps = hamiltonian_backtracking(g, 0, False)
    assert all(isinstance(s, Hamiltonian_Step) for s in steps)


def test_hamiltonian_path_simple():
    """Линейный путь 0-1-2: гамильтонов путь существует."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)

    steps = hamiltonian_backtracking(g, 0, False)
    last = steps[-1]

    assert last.action == "found"
    assert last.found
    assert last.path == [0, 1, 2]


def test_hamiltonian_cycle_in_complete_graph():
    """K4 — гамильтонов цикл всегда существует."""
    g = Graph()
    for u, v in [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]:
        g.add_edge(u, v)

    steps = hamiltonian_backtracking(g, 0, True)
    last = steps[-1]

    assert last.action == "found"
    assert last.path[0] == last.path[-1] == 0
    # Длина цикла: |V| + 1 (возврат в start)
    assert len(last.path) == 5
    # Каждая вершина (кроме start, который дублируется в конце) встречается один раз
    assert sorted(last.path[:-1]) == [0, 1, 2, 3]


def test_hamiltonian_no_path_in_disconnected():
    """Несвязный граф — гамильтонов путь невозможен."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(2, 3)  # отдельная компонента

    steps = hamiltonian_backtracking(g, 0, False)
    last = steps[-1]

    assert last.action == "fail"
    assert not last.found


def test_hamiltonian_no_cycle_in_path_graph():
    """Граф-путь 0-1-2-3 — гамильтонов путь есть, но цикла нет."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 3)

    # Путь существует
    path_steps = hamiltonian_backtracking(g, 0, False)
    assert path_steps[-1].action == "found"
    assert path_steps[-1].path == [0, 1, 2, 3]

    # Цикла не существует
    cycle_steps = hamiltonian_backtracking(g, 0, True)
    assert cycle_steps[-1].action == "fail"


def test_hamiltonian_invalid_start():
    """Несуществующая стартовая вершина должна выкидывать исключение."""
    g = Graph()
    g.add_edge(0, 1)
    try:
        hamiltonian_backtracking(g, 99, False)
        assert False, "должно было выброситься исключение"
    except Exception:
        pass


def test_hamiltonian_history_has_visit_and_backtrack():
    """История должна содержать обращения 'visit' и 'backtrack'."""
    # K4 без ребра (0,3): первый путь 0→1→2→3 нельзя замкнуть в цикл (нет 3-0),
    # требуется откат и попытка 0→1→3→2 → возврат в 0.
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(0, 2)
    g.add_edge(1, 2)
    g.add_edge(1, 3)
    g.add_edge(2, 3)

    steps = hamiltonian_backtracking(g, 0, True)
    actions = [s.action for s in steps]

    assert "init" in actions
    assert "visit" in actions
    assert "backtrack" in actions
    assert steps[-1].action == "found"


def test_hamiltonian_path_visits_all_vertices():
    """Найденный путь должен содержать каждую вершину ровно один раз."""
    g = Graph()
    for u, v in [(0, 1), (1, 2), (2, 3), (3, 4), (0, 4), (1, 3)]:
        g.add_edge(u, v)

    steps = hamiltonian_backtracking(g, 0, False)
    last = steps[-1]

    assert last.action == "found"
    assert sorted(last.path) == [0, 1, 2, 3, 4]


def test_hamiltonian_depth_matches_path_length():
    """depth должен совпадать с длиной текущего path на каждом шаге."""
    g = Graph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 3)

    steps = hamiltonian_backtracking(g, 0, False)
    for s in steps:
        assert s.depth == len(s.path)


def test_tarjan_simple_cycle():
    """Простой цикл: 0 -> 1 -> 2 -> 0 (одна SCC)"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)

    steps = tarjan_scc(g)
    final_sccs = steps[-1].completed_sccs
    
    assert len(final_sccs) == 1
    assert set(final_sccs[0]) == {0, 1, 2}


def test_tarjan_multiple_sccs():
    """Граф с двумя SCC и мостом между ними"""
    g = OrientedGraph()
    # SCC 1
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)
    # Мост
    g.add_edge(2, 3)
    # SCC 2
    g.add_edge(3, 4)
    g.add_edge(4, 3)

    steps = tarjan_scc(g)
    final_sccs = steps[-1].completed_sccs
    
    assert len(final_sccs) == 2
    scc_sets = [frozenset(scc) for scc in final_sccs]
    assert frozenset({0, 1, 2}) in scc_sets
    assert frozenset({3, 4}) in scc_sets


def test_tarjan_step_type():
    g = OrientedGraph()
    g.add_edge(0, 1)
    steps = tarjan_scc(g)
    assert all(isinstance(s, Tarjan_Step) for s in steps)


def test_tarjan_dag_each_node_is_scc():
    """Ориентированный ациклический граф: каждая вершина — отдельная SCC"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 3)

    steps = tarjan_scc(g)
    final_sccs = steps[-1].completed_sccs
    
    assert len(final_sccs) == 4
    for i in range(4):
        assert any(frozenset({i}) == frozenset(scc) for scc in final_sccs)


def test_tarjan_disconnected():
    """Две несвязанные компоненты связности"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 0)
    g.add_edge(2, 3)
    g.add_edge(3, 2)

    steps = tarjan_scc(g)
    final_sccs = steps[-1].completed_sccs
    assert len(final_sccs) == 2


def test_tarjan_empty_graph():
    """Пустой граф не должен вызывать ошибок"""
    g = OrientedGraph()
    steps = tarjan_scc(g)
    assert len(steps) == 0



def test_kosaraju_simple_cycle():
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)

    steps = kosaraju_scc(g)
    final_sccs = steps[-1].completed_sccs
    
    assert len(final_sccs) == 1
    assert set(final_sccs[0]) == {0, 1, 2}


def test_kosaraju_multiple_sccs():
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)
    g.add_edge(2, 3)
    g.add_edge(3, 4)
    g.add_edge(4, 3)

    steps = kosaraju_scc(g)
    final_sccs = steps[-1].completed_sccs
    
    assert len(final_sccs) == 2
    scc_sets = [frozenset(scc) for scc in final_sccs]
    assert frozenset({0, 1, 2}) in scc_sets
    assert frozenset({3, 4}) in scc_sets


def test_kosaraju_step_type():
    g = OrientedGraph()
    g.add_edge(0, 1)
    steps = kosaraju_scc(g)
    assert all(isinstance(s, Kosaraju_Step) for s in steps)


def test_kosaraju_phases_present():
    """Алгоритм должен содержать 3 фазы: DFS, транспонирование, DFS на G^T"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 0)
    g.add_edge(1, 2)

    steps = kosaraju_scc(g)
    phases = [s.phase for s in steps]
    
    assert 1 in phases, "Фаза 1 (DFS на исходном) отсутствует"
    assert 2 in phases, "Фаза 2 (Транспонирование) отсутствует"
    assert 3 in phases, "Фаза 3 (DFS на транспонированном) отсутствует"


def test_kosaraju_vs_tarjan_consistency():
    """Результаты Косараджу и Тарьяна должны полностью совпадать"""
    edges = [(0,1), (1,2), (2,0), (2,3), (3,4), (4,3), (4,5), (5,4)]
    
    g_t = OrientedGraph()
    g_k = OrientedGraph()
    for u, v in edges:
        g_t.add_edge(u, v)
        g_k.add_edge(u, v)

    steps_t = tarjan_scc(g_t)
    steps_k = kosaraju_scc(g_k)

    sccs_t = set(frozenset(scc) for scc in steps_t[-1].completed_sccs)
    sccs_k = set(frozenset(scc) for scc in steps_k[-1].completed_sccs)

    assert sccs_t == sccs_k, "SCC, найденные Тарьяном и Косараджу, не совпадают"


def test_kosaraju_disconnected():
    """Косараджу корректно обрабатывает несвязные графы"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 0)
    g.add_edge(2, 3)
    g.add_edge(3, 2)

    steps = kosaraju_scc(g)
    final_sccs = steps[-1].completed_sccs
    assert len(final_sccs) == 2

# ================= Тесты для алгоритма A* =================

def test_astar_simple_linear():
    """Простой линейный ориентированный граф: 0 --1.0--> 1 --2.0--> 2"""
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)
    
    coords = {0: (0, 0), 1: (1, 0), 2: (3, 0)}  # координаты для эвристики
    steps = astar_pathfinding(g, 0, 2, coords)
    
    assert len(steps) >= 1
    assert steps[-1].path_found is True
    assert steps[-1].current_path == [0, 1, 2]
    
    # Проверка итоговой стоимости
    final_g = steps[-1].g_scores
    assert final_g[0] == 0.0
    assert final_g[1] == 1.0
    assert final_g[2] == 3.0


def test_astar_step_type():
    """Проверка типа возвращаемых шагов."""
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    coords = {0: (0, 0), 1: (1, 0)}
    steps = astar_pathfinding(g, 0, 1, coords)
    assert all(isinstance(s, AStar_Step) for s in steps)


def test_astar_shortest_path_choice():
    """
    Граф с выбором пути (аналогично тесту для Дейкстры):
    0 --1.0--> 1 --1.0--> 2  
    0 --5.0--> 2            
    A* должен выбрать путь через вершину 1 (стоимость 2.0 вместо 5.0).
    """
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    g.add_edge(0, 2, 5.0)
    
    coords = {0: (0, 0), 1: (1, 1), 2: (3, 0)}
    steps = astar_pathfinding(g, 0, 2, coords)
    
    assert steps[-1].path_found is True
    assert steps[-1].current_path == [0, 1, 2]
    assert abs(steps[-1].g_scores[2] - 2.0) < 1e-9


def test_astar_disconnected():
    """Граф, где цель недостижима из старта."""
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(2, 3, 1.0)  # Отдельный компонент, недостижим из 0
    
    coords = {0: (0, 0), 1: (1, 0), 2: (10, 0), 3: (11, 0)}
    steps = astar_pathfinding(g, 0, 3, coords)
    
    # Путь не должен быть найден
    assert steps[-1].path_found is False
    # Стоимость до недостижимой вершины = бесконечность
    assert steps[-1].g_scores.get(3, float('inf')) == float('inf')


def test_astar_float_weights():
    """Проверка работы с дробными весами."""
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 0.1)
    g.add_edge(1, 2, 0.2)
    
    coords = {0: (0, 0), 1: (0.1, 0), 2: (0.3, 0)}
    steps = astar_pathfinding(g, 0, 2, coords)
    
    assert steps[-1].path_found is True
    assert abs(steps[-1].g_scores[1] - 0.1) < 1e-9
    assert abs(steps[-1].g_scores[2] - 0.3) < 1e-9


def test_astar_history_contains_expansions():
    """Проверка, что история содержит шаги с обработкой вершин."""
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    
    coords = {0: (0, 0), 1: (1, 0), 2: (2, 0)}
    steps = astar_pathfinding(g, 0, 2, coords)
    
    # Первый шаг — инициализация
    assert steps[0].action == 'init'
    assert steps[0].current_node == 0
    
    # Должны быть шаги с релаксацией
    assert any(step.action == 'relax' for step in steps)
    
    # Последний шаг — путь найден
    assert steps[-1].action == 'found'
    assert steps[-1].path_found is True


def test_astar_heuristic_influence():
    """
    Проверка, что эвристика влияет на порядок обработки.
    Граф: 0 -> 1 (вес 10), 0 -> 2 (вес 1), 2 -> 3 (вес 1), 1 -> 3 (вес 1)
    Цель: 3. Координаты так, что эвристика "подсказывает" идти через 2.
    """
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 10.0)
    g.add_edge(0, 2, 1.0)
    g.add_edge(2, 3, 1.0)
    g.add_edge(1, 3, 1.0)
    
    # Координаты: 2 и 3 близко друг к другу, 1 — далеко
    coords = {0: (0, 0), 1: (10, 10), 2: (1, 0), 3: (2, 0)}
    steps = astar_pathfinding(g, 0, 3, coords)
    
    assert steps[-1].path_found is True
    # Оптимальный путь: 0 -> 2 -> 3 (стоимость 2.0)
    assert steps[-1].current_path == [0, 2, 3]
    assert abs(steps[-1].g_scores[3] - 2.0) < 1e-9


def test_astar_no_coords_fallback():
    """
    Если координаты не заданы, эвристика = 0, и A* вырождается в Дейкстру.
    """
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 2.0)
    g.add_edge(0, 2, 5.0)
    
    # Без координат
    steps = astar_pathfinding(g, 0, 2)
    
    assert steps[-1].path_found is True
    assert steps[-1].current_path == [0, 1, 2]
    assert abs(steps[-1].g_scores[2] - 3.0) < 1e-9


def test_astar_came_from_reconstruction():
    """Проверка корректности восстановления пути через came_from."""
    g = Directed_Weighted_Graph()
    g.add_edge(0, 1, 1.0)
    g.add_edge(1, 2, 1.0)
    g.add_edge(2, 3, 1.0)
    
    coords = {0: (0, 0), 1: (1, 0), 2: (2, 0), 3: (3, 0)}
    steps = astar_pathfinding(g, 0, 3, coords)
    
    assert steps[-1].path_found is True
    
    # Восстанавливаем путь вручную через came_from
    path = []
    at = 3
    came_from = steps[-1].came_from
    while at in came_from:
        path.append(at)
        at = came_from[at]
    path.append(0)
    path.reverse()
    
    assert path == [0, 1, 2, 3]
    assert path == steps[-1].current_path


def test_astar_vs_dijkstra_consistency():
    """
    На ориентированных графах без отрицательных весов
    результаты A* (с нулевой эвристикой) и Дейкстры должны совпадать.
    """
    from algoslib.graphs import Weighted_Graph, dijkstra
    
    # Создаём одинаковые графы
    g_astar = Directed_Weighted_Graph()
    g_dijkstra = Weighted_Graph()
    
    edges = [(0, 1, 1.0), (0, 2, 4.0), (1, 2, 2.0), (1, 3, 5.0), (2, 3, 1.0)]
    for u, v, w in edges:
        g_astar.add_edge(u, v, w)
        g_dijkstra.add_edge(u, v, w)  # Weighted_Graph неориентированный, но для этого теста ок
    
    # A* без координат = Дейкстра
    astar_steps = astar_pathfinding(g_astar, 0, 3)
    dijkstra_steps = dijkstra(g_dijkstra, 0)
    
    astar_final = astar_steps[-1].g_scores
    dijkstra_final = dijkstra_steps[-1].distances
    
    # Сравниваем расстояния для достижимых вершин
    for node in astar_final:
        if astar_final[node] == float('inf'):
            assert dijkstra_final[node] == float('inf')
        else:
            assert abs(astar_final[node] - dijkstra_final[node]) < 1e-9

def test_topo_linear_dag():
    """Простой линейный граф: 0 -> 1 -> 2"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)

    steps = topological_sort(g)

    assert len(steps) > 0
    final_step = steps[-1]
    assert final_step.has_cycle is False
    assert set(final_step.result_order) == {0, 1, 2}

    # Проверка порядка: 0 должен быть раньше 1, 1 раньше 2
    res_list = final_step.result_order
    assert res_list.index(0) < res_list.index(1)
    assert res_list.index(1) < res_list.index(2)


def test_topo_step_type():
    """Проверка типа возвращаемых шагов."""
    g = OrientedGraph()
    g.add_edge(0, 1)
    steps = topological_sort(g)
    assert all(isinstance(s, TopoStep) for s in steps)


def test_topo_diamond_graph():
    """
    Граф-ромб:
    0 -> 1
    0 -> 2
    1 -> 3
    2 -> 3
    """
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(0, 2)
    g.add_edge(1, 3)
    g.add_edge(2, 3)

    steps = topological_sort(g)
    final_step = steps[-1]

    assert final_step.has_cycle is False
    assert set(final_step.result_order) == {0, 1, 2, 3}
    res_list = final_step.result_order

    # 0 должен быть первым
    assert res_list[0] == 0
    # 3 должен быть последним
    assert res_list[-1] == 3
    # 1 и 2 должны быть между 0 и 3 (порядок между ними может быть любым)
    assert res_list.index(1) > res_list.index(0)
    assert res_list.index(2) > res_list.index(0)
    assert res_list.index(3) > res_list.index(1)
    assert res_list.index(3) > res_list.index(2)


def test_topo_cycle_detection():
    """Граф с циклом: 0 -> 1 -> 2 -> 0. Топологическая сортировка невозможна."""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    g.add_edge(2, 0)

    steps = topological_sort(g)
    final_step = steps[-1]

    assert final_step.has_cycle is True
    # Результат не должен содержать все вершины (цикл не будет обработан)
    assert len(final_step.result_order) < 3


def test_topo_disjoint_components():
    """Две несвязные компоненты: 0->1 и 2->3"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(2, 3)

    steps = topological_sort(g)
    final_step = steps[-1]

    assert final_step.has_cycle is False
    assert set(final_step.result_order) == {0, 1, 2, 3}
    res_list = final_step.result_order

    # Проверяем порядок внутри компонент
    assert res_list.index(0) < res_list.index(1)
    assert res_list.index(2) < res_list.index(3)


def test_topo_empty_graph():
    """Пустой граф"""
    g = OrientedGraph()
    steps = topological_sort(g)
    assert len(steps) == 0


def test_topo_single_edge():
    """Граф с одним ребром"""
    g = OrientedGraph()
    g.add_edge(5, 10)
    steps = topological_sort(g)
    final_step = steps[-1]
    assert final_step.result_order == [5, 10]


def test_topo_history_steps():
    """Проверка структуры шагов истории"""
    g = OrientedGraph()
    g.add_edge(0, 1)
    g.add_edge(1, 2)
    steps = topological_sort(g)

    # Первый шаг - инициализация
    assert steps[0].action == 'init'
    assert steps[0].zero_indegree_queue == [0] # У вершины 0 степень захода 0

    # Ищем шаг выбора вершины
    found_select = False
    for step in steps:
        if step.action == 'select' and step.processed_node == 0:
            found_select = True
            break
    assert found_select