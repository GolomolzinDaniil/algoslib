#include "stalin_sort.hpp"

#include <algorithm>
#include <unordered_set>
#include <unordered_map>

// Сталин-сорт для графов: пытаемся построить клику, проходя по вершинам по порядку.
// Вершину оставляем только если она смежна со всеми уже оставленными.
// В противном случае — отправляем в ссылку.
// Результат — подграф-клика (часто очень маленькая).
std::vector<Stalin_Step> stalin_sort(const Graph& graph) {
    std::vector<Stalin_Step> history;

    // Получаем список вершин в детерминированном порядке
    std::vector<int> vertices;
    vertices.reserve(graph.adjacency_list.size());
    for (const auto& [v, _] : graph.adjacency_list) {
        vertices.push_back(v);
    }
    std::sort(vertices.begin(), vertices.end());

    // Строим множество смежности для быстрой проверки
    std::unordered_map<int, std::unordered_set<int>> adj_set;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (int v : neighbors) {
            adj_set[u].insert(v);
        }
    }

    std::vector<int> clique;
    std::vector<int> exiled;

    for (int v : vertices) {
        bool keep = true;
        int conflict = -1;

        // Проверяем, смежна ли v со всеми текущими членами клики
        for (int c : clique) {
            auto it = adj_set.find(v);
            if (it == adj_set.end() || it->second.find(c) == it->second.end()) {
                keep = false;
                conflict = c;
                break;
            }
        }

        if (keep) {
            clique.push_back(v);
        } else {
            exiled.push_back(v);
        }

        Stalin_Step step;
        step.current_node = v;
        step.accepted = keep;
        step.conflict_with = conflict;
        step.clique = clique;
        step.exiled = exiled;
        history.push_back(step);
    }

    return history;
}
