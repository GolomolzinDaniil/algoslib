#include "bellman_ford.hpp"
#include "graph_utils.hpp"  

#include <limits>
#include <stdexcept>
#include <tuple>

std::vector<Ford_Step> bellman_ford(const Weighted_Graph& graph, int start_node) {
    if (!graph.adjacency_list.count(start_node)) {
        throw std::invalid_argument("Start node does not exist in the graph.");
    }

    std::vector<Ford_Step> history;
    const double INF = std::numeric_limits<double>::infinity();

    // Инициализация расстояний
    std::unordered_map<int, double> distances;
    for (const auto& [node_id, _] : graph.adjacency_list) {
        distances[node_id] = INF;
    }
    distances[start_node] = 0.0;

    // Извлекаем ВСЕ рёбра из графа
    std::vector<std::tuple<int, int, double>> edges;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (const auto& [v, weight] : neighbors) {
            edges.emplace_back(u, v, weight);
        }
    }

    const int vertex_count = static_cast<int>(graph.adjacency_list.size());

    // Основной цикл: |V| - 1 итерация
    for (int iteration = 1; iteration <= vertex_count - 1; ++iteration) {
        bool any_relaxation = false;

        for (const auto& [u, v, weight] : edges) {
            if (distances[u] != INF && distances[u] + weight < distances[v]) {
                distances[v] = distances[u] + weight;
                any_relaxation = true;

                Ford_Step step;
                step.iteration = iteration;
                step.edge_from = u;
                step.edge_to = v;
                step.relaxed = true;
                step.distances = distances;
                history.push_back(step);
            }
        }
        if (!any_relaxation) {
            break;
        }
    }

    // Проверка на отрицательный цикл
    for (const auto& [u, v, weight] : edges) {
        if (distances[u] != INF && distances[u] + weight < distances[v]) {
            Ford_Step step;
            step.iteration = vertex_count;
            step.edge_from = u;
            step.edge_to = v;
            step.relaxed = true;
            step.distances = distances;
            history.push_back(step);
            break;
        }
    }

    return history;
}