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