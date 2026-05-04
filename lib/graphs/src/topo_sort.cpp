#include "topo_sort.hpp"
#include <queue>
#include <algorithm>

std::vector<TopoStep> topological_sort(const OrientedGraph& graph) {
    std::vector<TopoStep> history;
    if (graph.adjacency_list.empty()) return history;

    std::unordered_map<int, int> in_degree;
    std::vector<int> all_nodes;
    for (const auto& [u, _] : graph.adjacency_list) {
        in_degree[u] = 0;
        all_nodes.push_back(u);
    }
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (int v : neighbors) {
            in_degree[v]++;
            if (in_degree.find(v) == in_degree.end()) {
                in_degree[v] = 0;
                all_nodes.push_back(v);
            }
        }
    }
    std::sort(all_nodes.begin(), all_nodes.end());

    std::queue<int> q;
    for (int u : all_nodes) {
        if (in_degree[u] == 0) q.push(u);
    }

    auto queue_to_vec = [&q]() {
        std::vector<int> res;
        std::queue<int> temp = q;
        while (!temp.empty()) { res.push_back(temp.front()); temp.pop(); }
        return res;
    };

    TopoStep init_step;
    init_step.zero_indegree_queue = queue_to_vec();
    init_step.in_degree = in_degree;
    init_step.processed_node = -1; init_step.edge_from = -1; init_step.edge_to = -1;
    init_step.action = "init"; init_step.has_cycle = false;
    history.push_back(init_step);

    std::vector<int> result;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        result.push_back(u);

        TopoStep step;
        step.result_order = result;
        step.zero_indegree_queue = queue_to_vec();
        step.in_degree = in_degree;
        step.processed_node = u; step.edge_from = -1; step.edge_to = -1;
        step.action = "select"; step.has_cycle = false;
        history.push_back(step);

        auto it = graph.adjacency_list.find(u);
        if (it != graph.adjacency_list.end()) {
            for (int v : it->second) {
                // Шаг: исследование ребра
                step.action = "explore"; step.edge_from = u; step.edge_to = v;
                history.push_back(step);

                in_degree[v]--;
                // Шаг: обновление степени захода
                step.action = "update"; step.in_degree = in_degree;
                history.push_back(step);

                if (in_degree[v] == 0) {
                    q.push(v);
                    // Шаг: добавление в очередь
                    step.zero_indegree_queue = queue_to_vec();
                    step.action = "enqueue"; step.processed_node = v; step.edge_from = -1; step.edge_to = -1;
                    history.push_back(step);
                }
            }
        }
    }

    bool has_cycle = (result.size() < all_nodes.size());
    TopoStep final_step;
    final_step.result_order = result;
    final_step.zero_indegree_queue = queue_to_vec();
    final_step.in_degree = in_degree;
    final_step.processed_node = -1; final_step.edge_from = -1; final_step.edge_to = -1;
    final_step.action = has_cycle ? "cycle" : "done";
    final_step.has_cycle = has_cycle;
    history.push_back(final_step);

    return history;
}