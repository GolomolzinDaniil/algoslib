#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "bfs.hpp"
#include "graph_utils.hpp"
#include "dijkstra.hpp"

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
}