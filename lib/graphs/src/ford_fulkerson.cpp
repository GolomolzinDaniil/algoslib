#include "ford_fulkerson.hpp"
#include "graph_utils.hpp"

#include <limits>
#include <stdexcept>
#include <algorithm>
#include <queue>
#include <set>
#include <unordered_set>
#include <iostream>
#include <random>

bool dfs_find_path(
    int u,
    int sink,
    double min_cap,
    std::unordered_map<int, int>& parent,
    std::unordered_map<int, double>& path_capacity,
    std::unordered_map<int, std::unordered_map<int, double>>& residual,
    std::unordered_set<int>& visited
) {
    if (u == sink) {
        return true;
    }
    
    visited.insert(u);
    
    std::vector<std::pair<int, double>> edges;
    for (const auto& [v, cap] : residual[u]) {
        if (cap > 1e-9) {
            edges.emplace_back(v, cap);
        }
    }

    static std::random_device rd;
    static std::mt19937 gen(rd());
    std::shuffle(edges.begin(), edges.end(), gen);
    
    for (const auto& [v, cap] : edges) {
        if (!visited.count(v)) {
            parent[v] = u;
            path_capacity[v] = std::min(min_cap, cap);
            
            if (dfs_find_path(v, sink, path_capacity[v], parent, path_capacity, residual, visited)) {
                return true;
            }
        }
    }
    
    return false;
}

FordFulkerson_Result ford_fulkerson(const Flow_Graph& graph, int source, int sink) {
    if (!graph.adjacency_list.count(source)) {
        throw std::invalid_argument("Source node does not exist in the graph.");
    }
    if (!graph.adjacency_list.count(sink)) {
        throw std::invalid_argument("Sink node does not exist in the graph.");
    }

    FordFulkerson_Result result;
    result.max_flow = 0.0;

    // Инициализация остаточного графа
    std::unordered_map<int, std::unordered_map<int, double>> residual;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (const auto& [v, capacity] : neighbors) {
            residual[u][v] += capacity;
            residual[v][u] += 0.0;  // Обратное ребро
        }
    }

    std::unordered_map<int, std::unordered_map<int, double>> flow;

    int iteration = 0;
    const int MAX_ITERATIONS = 10000;

    while (iteration < MAX_ITERATIONS) {
        iteration++;

        // DFS для поиска увеличивающего пути 
        std::unordered_map<int, int> parent;
        std::unordered_map<int, double> path_capacity;
        std::unordered_set<int> visited;

        parent[source] = -1;
        path_capacity[source] = std::numeric_limits<double>::infinity();

        bool found_path = dfs_find_path(
            source, sink, 
            path_capacity[source], 
            parent, path_capacity, 
            residual, visited
        );

        if (!found_path || !parent.count(sink)) {
            break;
        }

        std::vector<int> augmenting_path;
        double flow_increase = path_capacity[sink];

        int curr = sink;
        while (curr != source) {
            augmenting_path.push_back(curr);
            curr = parent[curr];
        }
        augmenting_path.push_back(source);
        std::reverse(augmenting_path.begin(), augmenting_path.end());

        for (size_t i = 0; i < augmenting_path.size() - 1; ++i) {
            int u = augmenting_path[i];
            int v = augmenting_path[i + 1];
            
            residual[u][v] -= flow_increase;
            residual[v][u] += flow_increase;
        }

        result.max_flow += flow_increase;

        FordFulkerson_Step step;
        step.iteration = iteration;
        step.augmenting_path = augmenting_path;
        step.flow_increase = flow_increase;
        step.total_flow = result.max_flow;
        step.residual_capacities = residual;
        result.history.push_back(step);
    }

    result.flow = flow;
    return result;
}