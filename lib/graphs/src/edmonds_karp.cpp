#include "edmonds_karp.hpp"
#include "graph_utils.hpp"

#include <limits>
#include <stdexcept>
#include <algorithm>
#include <queue>
#include <set>
#include <iostream>

EdmondsKarp_Result edmonds_karp(const Flow_Graph& graph, int source, int sink) {
    if (!graph.adjacency_list.count(source)) {
        throw std::invalid_argument("Source node does not exist in the graph.");
    }
    if (!graph.adjacency_list.count(sink)) {
        throw std::invalid_argument("Sink node does not exist in the graph.");
    }

    EdmondsKarp_Result result;
    result.max_flow = 0.0;

    // Инициализация остаточного графа
    std::unordered_map<int, std::unordered_map<int, double>> residual;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (const auto& [v, capacity] : neighbors) {
            residual[u][v] += capacity;
            residual[v][u] += 0.0;  // Обратное ребро
        }
    }

    // Инициализация потока
    std::unordered_map<int, std::unordered_map<int, double>> flow;

    int iteration = 0;
    const int MAX_ITERATIONS = 10000;

    while (iteration < MAX_ITERATIONS) {
        iteration++;

        // BFS для поиска кратчайшего увеличивающего пути 
        std::unordered_map<int, int> parent;
        std::unordered_map<int, double> path_capacity;
        std::queue<int> q;

        parent[source] = -1;
        path_capacity[source] = std::numeric_limits<double>::infinity();
        q.push(source);

        bool found_path = false;
        
        while (!q.empty() && !found_path) {
            int u = q.front();
            q.pop();

            for (const auto& [v, cap] : residual[u]) {
                if (!parent.count(v) && cap > 1e-9) {
                    parent[v] = u;
                    path_capacity[v] = std::min(path_capacity[u], cap);
                    
                    if (v == sink) {
                        found_path = true;
                        break;
                    }
                    q.push(v);
                }
            }
        }

        if (!parent.count(sink)) {
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

        EdmondsKarp_Step step;
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