#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "bfs.hpp"
#include "graph_utils.hpp"
#include "dijkstra.hpp"
#include "bellman_ford.hpp"
#include "kruskal.hpp"
#include "stalin_sort.hpp"
#include "ford_fulkerson.hpp"
#include "edmonds_karp.hpp"
#include "hierholzer.hpp"
#include "hamiltonian.hpp"

namespace py = pybind11;

PYBIND11_MODULE(sub_graphs, m) {
    py::class_<Graph>(m, "Graph")
        .def(py::init<>())
        .def("add_edge", &Graph::add_edge, "Добавить ребро между вершинами")
        .def("get_neighbors", &Graph::get_neighbors, "Получить соседей вершины");

    py::class_<BFS_Step>(m, "BFS_Step")
        .def_readonly("current_node", &BFS_Step::current_node)
        .def_readonly("visited", &BFS_Step::visited)
        .def_readonly("queue", &BFS_Step::queue);

    m.def("bfs", &bfs, "Поиск в ширину (BFS)");

    py::class_<Weighted_Graph>(m, "Weighted_Graph")
        .def(py::init<>())
        .def("add_edge", 
             &Weighted_Graph::add_edge, 
             py::arg("u"), py::arg("v"), py::arg("weight"),
             "Добавить взвешенное ребро")
        .def("get_neighbors", 
             &Weighted_Graph::get_neighbors,
             "Вернуть список соседей с весами: List[Tuple[int, float]]");

    // Структура шага алгоритма Дейкстры
    py::class_<Dijkstra_Step>(m, "Dijkstra_Step")
        .def_readonly("current_node", &Dijkstra_Step::current_node, 
                      "Текущая обрабатываемая вершина")
        .def_readonly("distances", &Dijkstra_Step::distances, 
                      "Словарь {node_id: расстояние} (float)")
        .def_readonly("visited", &Dijkstra_Step::visited, 
                      "Список уже посещённых вершин")
        .def_readonly("queue", &Dijkstra_Step::queue, 
                      "Список вершин в очереди приоритетов");

    // Функция dijkstra
    m.def("dijkstra", 
          &dijkstra,
          py::arg("graph"), py::arg("start_node"),
          "Алгоритм Дейкстры. Возвращает список шагов (List[DijkstraStep])");

    // Структура шага алгоритма Беллмана-Форда
    py::class_<Ford_Step>(m, "Ford_Step")
        .def_readonly("iteration", &Ford_Step::iteration, 
                      "Номер итерации алгоритма (1..|V|-1, или |V| при обнаружении цикла)")
        .def_readonly("edge_from", &Ford_Step::edge_from, 
                      "Исходная вершина релаксируемого ребра")
        .def_readonly("edge_to", &Ford_Step::edge_to, 
                      "Целевая вершина релаксируемого ребра")
        .def_readonly("relaxed", &Ford_Step::relaxed, 
                      "Была ли выполнена релаксация на этом шаге (bool)")
        .def_readonly("distances", &Ford_Step::distances, 
                      "Словарь {node_id: текущее расстояние} (float)");

    // Функция bellman_ford
    m.def("bellman_ford",
          &bellman_ford,
          py::arg("graph"), py::arg("start_node"),
          "Алгоритм Беллмана-Форда. Возвращает список шагов (List[Ford_Step]). "
          "Поддерживает рёбра с отрицательным весом.");

    // Структура шага алгоритма Краскала
    py::class_<Kruskal_Step>(m, "Kruskal_Step")
        .def_readonly("edge_from", &Kruskal_Step::edge_from,
                      "Исходная вершина рассматриваемого ребра")
        .def_readonly("edge_to", &Kruskal_Step::edge_to,
                      "Целевая вершина рассматриваемого ребра")
        .def_readonly("edge_weight", &Kruskal_Step::edge_weight,
                      "Вес рассматриваемого ребра")
        .def_readonly("accepted", &Kruskal_Step::accepted,
                      "Было ли ребро принято в MST (bool)")
        .def_readonly("mst_edges", &Kruskal_Step::mst_edges,
                      "Текущие рёбра MST: List[Tuple[int, int, float]]")
        .def_readonly("total_weight", &Kruskal_Step::total_weight,
                      "Текущий суммарный вес MST")
        .def_readonly("components", &Kruskal_Step::components,
                      "Словарь {node_id: component_id}");

    // Функция kruskal
    m.def("kruskal",
          &kruskal,
          py::arg("graph"),
          "Алгоритм Краскала. Возвращает список шагов (List[Kruskal_Step]). "
          "Строит минимальное остовное дерево.");

    // Структура шага алгоритма Сталин-сорта для графов
    py::class_<Stalin_Step>(m, "Stalin_Step")
        .def_readonly("current_node", &Stalin_Step::current_node,
                      "Текущая рассматриваемая вершина")
        .def_readonly("accepted", &Stalin_Step::accepted,
                      "Была ли вершина принята в клику (bool)")
        .def_readonly("conflict_with", &Stalin_Step::conflict_with,
                      "Вершина клики, с которой возник конфликт (-1 если нет)")
        .def_readonly("clique", &Stalin_Step::clique,
                      "Текущее множество оставленных вершин (клика)")
        .def_readonly("exiled", &Stalin_Step::exiled,
                      "Вершины, отправленные в ссылку");

    // Функция stalin_sort
    m.def("stalin_sort",
          &stalin_sort,
          py::arg("graph"),
          "Сталин-сорт для графов. Возвращает список шагов (List[Stalin_Step]). "
          "Оставляет только вершины, образующие клику, остальные ссылает.");

    py::class_<Flow_Graph>(m, "Flow_Graph")
        .def(py::init<>())
        .def("add_edge", 
             &Flow_Graph::add_edge, 
             py::arg("u"), py::arg("v"), py::arg("capacity"),
             "Добавить ребро с пропускной способностью")
        .def("get_neighbors", 
             &Flow_Graph::get_neighbors,
             "Вернуть список соседей с пропускными способностями");

    py::class_<FordFulkerson_Step>(m, "FordFulkerson_Step")
        .def_readonly("iteration", &FordFulkerson_Step::iteration,
                      "Номер итерации (найденного увеличивающего пути)")
        .def_readonly("augmenting_path", &FordFulkerson_Step::augmenting_path,
                      "Список вершин увеличивающего пути от source к sink")
        .def_readonly("flow_increase", &FordFulkerson_Step::flow_increase,
                      "Величина увеличения потока на этой итерации")
        .def_readonly("total_flow", &FordFulkerson_Step::total_flow,
                      "Накопленный максимальный поток")
        .def_readonly("residual_capacities", &FordFulkerson_Step::residual_capacities,
                      "Остаточные пропускные способности рёбер");

    py::class_<FordFulkerson_Result>(m, "FordFulkerson_Result")
        .def_readonly("max_flow", &FordFulkerson_Result::max_flow,
                      "Максимальный поток от source к sink")
        .def_readonly("flow", &FordFulkerson_Result::flow,
                      "Поток по каждому ребру: {u: {v: flow}}")
        .def_readonly("history", &FordFulkerson_Result::history,
                      "История выполнения алгоритма (список шагов)");

    m.def("ford_fulkerson", 
          &ford_fulkerson,
          py::arg("graph"), py::arg("source"), py::arg("sink"),
          "Алгоритм Форда-Фалкерсона. Возвращает FordFulkerson_Result");
    
    py::class_<EdmondsKarp_Step>(m, "EdmondsKarp_Step")
    .def_readonly("iteration", &EdmondsKarp_Step::iteration,
                  "Номер итерации")
    .def_readonly("augmenting_path", &EdmondsKarp_Step::augmenting_path,
                  "Увеличивающий путь")
    .def_readonly("flow_increase", &EdmondsKarp_Step::flow_increase,
                  "Увеличение потока")
    .def_readonly("total_flow", &EdmondsKarp_Step::total_flow,
                  "Накопленный поток")
    .def_readonly("residual_capacities", &EdmondsKarp_Step::residual_capacities,
                  "Остаточные пропускные способности");

    py::class_<EdmondsKarp_Result>(m, "EdmondsKarp_Result")
        .def_readonly("max_flow", &EdmondsKarp_Result::max_flow,
                    "Максимальный поток")
        .def_readonly("flow", &EdmondsKarp_Result::flow,
                    "Поток по рёбрам")
        .def_readonly("history", &EdmondsKarp_Result::history,
                    "История шагов");

    m.def("edmonds_karp",
        &edmonds_karp,
        py::arg("graph"), py::arg("source"), py::arg("sink"),
        "Алгоритм Эдмондса-Карпа (BFS версия Форда-Фалкерсона)");

    // Структура шага алгоритма Хирхольцера
    py::class_<Hierholzer_Step>(m, "Hierholzer_Step")
        .def_readonly("current_node", &Hierholzer_Step::current_node,
                      "Текущая обрабатываемая вершина")
        .def_readonly("action", &Hierholzer_Step::action,
                      "Тип шага: 'init', 'push', 'pop', 'no_path', 'done'")
        .def_readonly("stack", &Hierholzer_Step::stack,
                      "Текущее состояние стека алгоритма")
        .def_readonly("circuit", &Hierholzer_Step::circuit,
                      "Накопленный эйлеров путь/цикл (в финальном шаге — итог)")
        .def_readonly("remaining_edges", &Hierholzer_Step::remaining_edges,
                      "Список ещё не пройденных рёбер: List[Tuple[int, int]]")
        .def_readonly("euler_exists", &Hierholzer_Step::euler_exists,
                      "Существует ли в графе эйлеров путь/цикл")
        .def_readonly("is_circuit", &Hierholzer_Step::is_circuit,
                      "True - найден эйлеров цикл, False - эйлеров путь");

    // Функция hierholzer
    m.def("hierholzer",
          &hierholzer,
          py::arg("graph"),
          "Алгоритм Хирхольцера. Находит эйлеров путь или цикл в неориентированном "
          "графе. Возвращает список шагов (List[Hierholzer_Step]).");

    // Структура шага Backtracking-поиска гамильтонова пути/цикла
    py::class_<Hamiltonian_Step>(m, "Hamiltonian_Step")
        .def_readonly("current_node", &Hamiltonian_Step::current_node,
                      "Вершина, которую сейчас пробуем")
        .def_readonly("action", &Hamiltonian_Step::action,
                      "Тип шага: 'init', 'visit', 'backtrack', 'found', 'fail'")
        .def_readonly("path", &Hamiltonian_Step::path,
                      "Текущая последовательность вершин в пути")
        .def_readonly("visited", &Hamiltonian_Step::visited,
                      "Отсортированный список посещённых вершин")
        .def_readonly("depth", &Hamiltonian_Step::depth,
                      "Глубина рекурсии (длина текущего пути)")
        .def_readonly("found", &Hamiltonian_Step::found,
                      "Найден ли уже гамильтонов путь/цикл к этому шагу");

    // Функция hamiltonian_backtracking
    m.def("hamiltonian_backtracking",
          &hamiltonian_backtracking,
          py::arg("graph"), py::arg("start_node"), py::arg("find_cycle") = false,
          "Перебор с возвратом для поиска гамильтонова пути или цикла. "
          "find_cycle=True ищет гамильтонов цикл (с возвратом в start_node). "
          "Возвращает список шагов (List[Hamiltonian_Step]).");
}