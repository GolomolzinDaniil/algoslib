#pragma once
#include <vector>
#include <unordered_map>
#include <string>
#include "graph_utils.hpp"

struct DSU_Step {
    int edge_from;
    int edge_to;
    std::string action;           // "init", "explore", "union", "skip", "done"
    bool accepted;                // Произошло ли объединение
    std::unordered_map<int, int> parent;         // Дерево DSU
    std::unordered_map<int, int> component_root; // Вершина -> корень компоненты
    int components_count;
};

std::vector<DSU_Step> connected_components(const Graph& graph);