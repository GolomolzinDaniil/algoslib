#pragma once

#include <vector>
#include <string>
#include "graph_utils.hpp"

// структура для шагов алгоритма Хирхольцера
struct Hierholzer_Step {
    int current_node;                                   // Текущая вершина
    std::string action;                                 // "init" | "push" | "pop" | "no_path" | "done"
    std::vector<int> stack;                             // Текущее состояние стека
    std::vector<int> circuit;                           // Текущий накопленный эйлеров путь/цикл
    std::vector<std::pair<int, int>> remaining_edges;  // Ещё не пройденные рёбра
    bool euler_exists;                                  // Существует ли эйлеров путь/цикл
    bool is_circuit;                                    // True - цикл, False - путь
};

std::vector<Hierholzer_Step> hierholzer(const Graph& graph);
