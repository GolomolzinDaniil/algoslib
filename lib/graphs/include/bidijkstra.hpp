// bidijkstra.hpp
#pragma once

#include <vector>
#include <unordered_map>
#include <string>
#include "graph_utils.hpp"

struct BiDijkstra_Step {
    int phase;                                          // 1: forward, 2: backward, 3: meeting/reconstruction
    int current_node;                                   // Текущая вершина
    std::vector<int> forward_open, forward_closed;      // Фронты вперёд
    std::vector<int> backward_open, backward_closed;    // Фронты назад
    std::unordered_map<int, double> forward_dist;       // Расстояния от source
    std::unordered_map<int, double> backward_dist;      // Расстояния от target
    std::unordered_map<int, int> forward_parent;        // Родители вперёд
    std::unordered_map<int, int> backward_parent;       // Родители назад
    int edge_from, edge_to;                             // Исследуемое ребро
    std::string action;                                 // "init", "forward_expand", "backward_expand", "relax", "meet", "reconstruct", "no_path"
    bool path_found;
    std::vector<int> current_path;                      // Восстановленный путь
    double total_cost;                                  // Стоимость пути
};

std::vector<BiDijkstra_Step> bidijkstra(const Directed_Weighted_Graph& graph, int source, int target);