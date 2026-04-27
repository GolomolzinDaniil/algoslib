#pragma once

#include <vector>
#include <string>
#include "graph_utils.hpp"

// структура для шагов Backtracking-поиска гамильтонова пути/цикла
struct Hamiltonian_Step {
    int current_node;          // Вершина, которую сейчас пробуем
    std::string action;        // "init" | "visit" | "backtrack" | "found" | "fail"
    std::vector<int> path;     // Текущий путь (последовательность вершин)
    std::vector<int> visited;  // Текущее множество посещённых вершин (отсортировано)
    int depth;                 // Глубина рекурсии (длина пути)
    bool found;                // Найден ли уже путь к этому шагу
};

// Backtracking. find_cycle = true — ищет гамильтонов цикл (возвращается в start_node).
std::vector<Hamiltonian_Step> hamiltonian_backtracking(const Graph& graph,
                                                      int start_node,
                                                      bool find_cycle);
