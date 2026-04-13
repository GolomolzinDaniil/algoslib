#pragma once

#include <vector>
#include "graph_utils.hpp"

// структура для шагов алгоритма Краскала
struct Kruskal_Step {
    int edge_from;      // Исходная вершина рассматриваемого ребра
    int edge_to;        // Целевая вершина рассматриваемого ребра
    double edge_weight;  // Вес рассматриваемого ребра
    bool accepted;       // Было ли ребро принято в MST
    std::vector<std::tuple<int, int, double>> mst_edges; // Текущие рёбра MST
    double total_weight; // Текущий суммарный вес MST
    std::unordered_map<int, int> components; // Компонента каждой вершины (node -> component_id)
};

std::vector<Kruskal_Step> kruskal(const Weighted_Graph& graph);
