// coloring.hpp
#pragma once
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include "graph_utils.hpp"

struct ColoringStep {
    int current_node;
    std::unordered_map<int, int> color_assignment;  // node → color (0-based)
    int used_colors;                                 // количество использованных цветов
    bool conflict;                                   // был ли конфликт (не должно быть для жадного)
    std::vector<int> available_colors;               // доступные цвета для current_node
    std::string action;                              // "init", "assign", "conflict_check", "done"
};

// Жадная раскраска графа: назначает минимальный доступный цвет каждой вершине
std::vector<ColoringStep> greedy_coloring(const Graph& graph);