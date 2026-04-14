#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "bfs.hpp"
#include "graph_utils.hpp"
#include "dijkstra.hpp"
#include "bellman_ford.hpp"
#include "kruskal.hpp"
#include "ford_fulkerson.hpp"
#include "edmonds_karp.hpp"

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
}