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
#include "tarjan.hpp"
#include "kosaraju.hpp"

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


     py::class_<Tarjan_Step>(m, "Tarjan_Step")
        .def_readonly("current_node", &Tarjan_Step::current_node,
                      "Текущая обрабатываемая вершина")
        .def_readonly("stack", &Tarjan_Step::stack,
                      "Стек DFS: список вершин в текущем пути")
        .def_readonly("index_map", &Tarjan_Step::index_map,
                      "Словарь {node_id: discovery_index}")
        .def_readonly("lowlink_map", &Tarjan_Step::lowlink_map,
                      "Словарь {node_id: lowlink_value}")
        .def_readonly("on_stack_nodes", &Tarjan_Step::on_stack_nodes,
                      "Список вершин, находящихся на стеке")
        .def_readonly("edge_from", &Tarjan_Step::edge_from,
                      "Исходная вершина исследуемого ребра (-1 если нет)")
        .def_readonly("edge_to", &Tarjan_Step::edge_to,
                      "Целевая вершина исследуемого ребра (-1 если нет)")
        .def_readonly("edge_type", &Tarjan_Step::edge_type,
                      "Тип ребра: 'tree', 'back', 'cross', 'forward', 'none'")
        .def_readonly("completed_sccs", &Tarjan_Step::completed_sccs,
                      "Список уже найденных компонент связности: List[List[int]]")
        .def_readonly("current_scc", &Tarjan_Step::current_scc,
                      "Компонента, извлекаемая из стека на этом шаге: List[int]")
        .def_readonly("action", &Tarjan_Step::action,
                      "Тип действия: 'visit', 'explore_edge', 'update_lowlink', 'found_scc', 'done'")
        .def_readonly("index_counter", &Tarjan_Step::index_counter,
                      "Текущее значение счётчика индексов");

    py::class_<OrientedGraph>(m, "OrientedGraph")
        .def(py::init<>())
        .def("add_edge", &OrientedGraph::add_edge, py::arg("u"), py::arg("v"),
             "Добавить направленное ребро u -> v")
        .def("get_neighbors", &OrientedGraph::get_neighbors,
             "Получить список исходящих соседей вершины");

    m.def("tarjan_scc", &tarjan_scc, py::arg("graph"),
          "Алгоритм Тарьяна для поиска сильно связных компонент (SCC). "
          "Возвращает список шагов для визуализации.");

    py::class_<Kosaraju_Step>(m, "Kosaraju_Step")
        .def_readonly("phase", &Kosaraju_Step::phase,
                      "Номер фазы: 1=DFS исходный, 2=транспонирование, 3=DFS транспонированный")
        .def_readonly("current_node", &Kosaraju_Step::current_node,
                      "Текущая вершина")
        .def_readonly("stack", &Kosaraju_Step::stack,
                      "Стек DFS")
        .def_readonly("finish_order", &Kosaraju_Step::finish_order,
                      "Порядок завершения вершин (после фазы 1)")
        .def_readonly("processing_order", &Kosaraju_Step::processing_order,
                      "Порядок обработки в фазе 3")
        .def_readonly("edge_from", &Kosaraju_Step::edge_from,
                      "Исследуемое ребро: from")
        .def_readonly("edge_to", &Kosaraju_Step::edge_to,
                      "Исследуемое ребро: to")
        .def_readonly("completed_sccs", &Kosaraju_Step::completed_sccs,
                      "Найденные компоненты: List[List[int]]")
        .def_readonly("current_scc", &Kosaraju_Step::current_scc,
                      "Извлекаемая компонента сейчас")
        .def_readonly("action", &Kosaraju_Step::action,
                      "Действие: 'start_dfs1', 'visit', 'finish', 'transpose', 'start_dfs2', 'found_scc', 'done'")
        .def_readonly("is_transposed_edge", &Kosaraju_Step::is_transposed_edge,
                      "Является ли ребро транспонированным (bool)");

    m.def("kosaraju_scc",
          &kosaraju_scc,
          py::arg("graph"),
          "Алгоритм Косараджу для поиска сильно связных компонент. "
          "Возвращает список шагов (List[Kosaraju_Step]) для визуализации.");
}