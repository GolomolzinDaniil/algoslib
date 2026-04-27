#include "hamiltonian.hpp"

#include <algorithm>
#include <functional>
#include <unordered_set>
#include <unordered_map>
#include <stdexcept>
#include <vector>

// Перебор с возвратом для поиска гамильтонова пути или цикла.
//
// Гамильтонов путь — путь, проходящий через каждую вершину ровно один раз.
// Гамильтонов цикл — то же, но финиш совпадает со стартом.
//
// Сложность экспоненциальная (NP-полная задача), используется именно перебор с возвратом:
// идём в глубину, при тупике откатываемся и пробуем другого соседа.
//
// История содержит каждое посещение и откат — для пошаговой визуализации.
std::vector<Hamiltonian_Step> hamiltonian_backtracking(const Graph& graph,
                                                      int start_node,
                                                      bool find_cycle) {
    if (!graph.adjacency_list.count(start_node)) {
        throw std::invalid_argument("Start node does not exist in the graph.");
    }

    std::vector<Hamiltonian_Step> history;

    // Детерминированный порядок вершин/соседей
    std::vector<int> vertices;
    vertices.reserve(graph.adjacency_list.size());
    for (const auto& [v, _] : graph.adjacency_list) {
        vertices.push_back(v);
    }
    std::sort(vertices.begin(), vertices.end());
    const int total_vertices = static_cast<int>(vertices.size());

    std::unordered_map<int, std::vector<int>> sorted_adj;
    for (int u : vertices) {
        std::vector<int> n = graph.adjacency_list.at(u);
        std::sort(n.begin(), n.end());
        sorted_adj[u] = std::move(n);
    }

    std::vector<int> path = {start_node};
    std::unordered_set<int> visited = {start_node};
    bool found = false;

    auto sorted_visited = [&]() {
        std::vector<int> out(visited.begin(), visited.end());
        std::sort(out.begin(), out.end());
        return out;
    };

    auto record_step = [&](int node, const std::string& action) {
        Hamiltonian_Step step;
        step.current_node = node;
        step.action = action;
        step.path = path;
        step.visited = sorted_visited();
        step.depth = static_cast<int>(path.size());
        step.found = found;
        history.push_back(step);
    };

    record_step(start_node, "init");

    // Рекурсия в виде лямбды
    std::function<bool(int)> backtrack = [&](int current) -> bool {
        // База: посетили все вершины
        if (static_cast<int>(path.size()) == total_vertices) {
            if (find_cycle) {
                // Для цикла нужно ребро обратно в start_node
                const auto& neighbors = sorted_adj[current];
                if (std::find(neighbors.begin(), neighbors.end(), start_node) != neighbors.end()) {
                    found = true;
                    path.push_back(start_node);
                    record_step(start_node, "found");
                    path.pop_back();
                    return true;
                }
                return false;
            }
            found = true;
            record_step(current, "found");
            return true;
        }

        for (int next : sorted_adj[current]) {
            if (visited.count(next)) continue;

            path.push_back(next);
            visited.insert(next);
            record_step(next, "visit");

            if (backtrack(next)) return true;

            path.pop_back();
            visited.erase(next);
            record_step(next, "backtrack");
        }
        return false;
    };

    bool ok = backtrack(start_node);

    if (!ok) {
        record_step(start_node, "fail");
    }

    return history;
}
