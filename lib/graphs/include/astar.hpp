// astar.hpp
#pragma once

#include <vector>
#include <unordered_map>
#include <string>
#include "graph_utils.hpp"

// Структура шага алгоритма A* для визуализации
struct AStar_Step {
    int current_node;                                          // Текущая обрабатываемая вершина
    std::vector<int> open_set;                                 // Вершины в очереди приоритетов (open set)
    std::vector<int> closed_set;                               // Посещённые вершины (closed set)
    std::unordered_map<int, double> g_scores;                  // {node: cost_from_start}
    std::unordered_map<int, double> h_scores;                  // {node: heuristic_to_goal}
    std::unordered_map<int, double> f_scores;                  // {node: g + h}
    std::unordered_map<int, int> came_from;                    // {node: parent} для восстановления пути
    
    int edge_from;                                             // Исследуемое ребро: from
    int edge_to;                                               // Исследуемое ребро: to
    
    std::vector<int> current_path;                             // Текущий путь от start к current (для отладки)
    bool path_found;                                           // Найден ли путь к цели
    
    std::string action;                                        // "init", "expand", "relax", "found", "no_path"
};

// Алгоритм A* с поддержкой пошаговой визуализации
// graph — взвешенный ориентированный граф
// start, goal — стартовая и целевая вершины
// heuristic — функция эвристики (по умолчанию евклидово расстояние)
std::vector<AStar_Step> astar_pathfinding(
    const Directed_Weighted_Graph& graph,
    int start,
    int goal,
    const std::unordered_map<int, std::pair<double, double>>& node_coords = {}
);