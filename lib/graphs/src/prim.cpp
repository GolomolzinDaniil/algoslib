#include "prim.hpp"

#include <algorithm>
#include <functional>
#include <queue>
#include <stdexcept>
#include <tuple>
#include <unordered_set>
#include <vector>

std::vector<Prim_Step> prim(const Weighted_Graph& graph, int start_node) {
    if (!graph.adjacency_list.count(start_node)) {
        throw std::invalid_argument("Start node does not exist in the graph.");
    }

    using frontier_edge = std::tuple<double, int, int>;

    std::priority_queue<frontier_edge, std::vector<frontier_edge>, std::greater<frontier_edge>> pq;
    std::unordered_set<int> visited = {start_node};
    std::vector<std::tuple<int, int, double>> mst_edges;
    std::vector<Prim_Step> history;
    double total_weight = 0.0;

    for (const auto& [neighbor, weight] : graph.get_neighbors(start_node)) {
        pq.push({weight, start_node, neighbor});
    }

    while (!pq.empty()) {
        auto [weight, from, to] = pq.top();
        pq.pop();

        const bool accepted = !visited.count(to);
        if (accepted) {
            visited.insert(to);
            mst_edges.emplace_back(from, to, weight);
            total_weight += weight;

            for (const auto& [next, next_weight] : graph.get_neighbors(to)) {
                if (!visited.count(next)) {
                    pq.push({next_weight, to, next});
                }
            }
        }

        Prim_Step step;
        step.current_node = to;
        step.edge_from = from;
        step.edge_to = to;
        step.edge_weight = weight;
        step.accepted = accepted;
        step.visited.assign(visited.begin(), visited.end());
        std::sort(step.visited.begin(), step.visited.end());

        auto pq_copy = pq;
        std::unordered_set<int> queued_nodes;
        while (!pq_copy.empty()) {
            const auto next_node = std::get<2>(pq_copy.top());
            if (queued_nodes.insert(next_node).second) {
                step.queue.push_back(next_node);
            }
            pq_copy.pop();
        }

        step.mst_edges = mst_edges;
        step.total_weight = total_weight;
        history.push_back(std::move(step));
    }

    return history;
}
