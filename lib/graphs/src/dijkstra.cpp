#include "../include/dijkstra.hpp"
#include <queue>
#include <unordered_set>
#include <unordered_map>
#include <stdexcept>
#include <limits>
#include <vector>

std::vector<Dijkstra_Step> dijkstra(const Weighted_Graph& graph, int start_node) {
    if (!graph.adjacency_list.count(start_node)) {
        throw std::invalid_argument("Start node does not exist in the graph.");
    }

    std::vector<Dijkstra_Step> history;

    const double INF = std::numeric_limits<double>::infinity();

    std::unordered_map<int, double> distances;
    std::unordered_set<int> visited;

    // приоритетная очередь сортирует по первому элементу 
    using vertex = std::pair<double, int>;
    std::priority_queue<vertex, std::vector<vertex>, std::greater<>> pq;

    for (const auto& [node_id, _] : graph.adjacency_list) {
        distances[node_id] = INF;
    }
    distances[start_node] = 0.0;
    pq.push({0.0, start_node});

    while (!pq.empty()) {
        auto [curr_dist, curr_node] = pq.top();
        pq.pop();

        // Пропускаем устаревшие записи
        if (visited.count(curr_node) || distances[curr_node] < curr_dist) {
            continue;
        }

        visited.insert(curr_node);

        Dijkstra_Step step;
        step.current_node = curr_node;
        step.distances = distances; 
        step.visited = {visited.begin(), visited.end()};

        // копируем содержимое очереди
        std::priority_queue<vertex, std::vector<vertex>, std::greater<>> pq_copy = pq;
        while (!pq_copy.empty()) {
            step.queue.push_back(pq_copy.top().second); 
            pq_copy.pop();
        }
        history.push_back(step);

        for (const auto& [neighbor, weight] : graph.get_neighbors(curr_node)) {
            if (!visited.count(neighbor)) {
                double new_dist = distances[curr_node] + weight;
                if (new_dist < distances[neighbor]) {
                    distances[neighbor] = new_dist;
                    pq.push({new_dist, neighbor});
                }
            }
        }
    }

    return history;
}