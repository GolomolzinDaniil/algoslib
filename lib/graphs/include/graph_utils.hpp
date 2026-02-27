#pragma once

#include <vector>
#include <unordered_map>

// представление графа через список смежности
struct Graph {
    std::unordered_map<int, std::vector<int>> adjacency_list;

    void add_edge(int u, int v) {
        adjacency_list[u].push_back(v);
        adjacency_list[v].push_back(u); // для неориентированного
    }

    const std::vector<int>& get_neighbors(int u) const {
        return adjacency_list.at(u);
    }
};

// структура для шагов BFS
struct BFS_Step {
    int current_node;
    std::vector<int> visited;
    std::vector<int> queue;
};

// представление взвешенного графа через список пар смежности с весами
struct Weighted_Graph {
    std::unordered_map<int, std::vector<std::pair<int, double>>> adjacency_list;

    void add_edge(int u, int v, double weight) {
        adjacency_list[u].emplace_back(v, weight);
        adjacency_list[v].emplace_back(u, weight); // для неориентированного
    }

    const std::vector<std::pair<int, double>> get_neighbors(int u) const {
        return adjacency_list.at(u);
    }
};

// структура для шагов Дейкстры
struct Dijkstra_Step {
    int current_node;
    std::unordered_map<int, double> distances;
    std::vector<int> visited;
    std::vector<int> queue;
};