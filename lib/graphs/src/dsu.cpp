#include "dsu.hpp"
#include <set>
#include <algorithm>

struct DSU {
    std::unordered_map<int, int> parent;
    std::unordered_map<int, int> rank;
    int components = 0;

    void make_set(int v) {
        if (parent.find(v) == parent.end()) {
            parent[v] = v;
            rank[v] = 0;
            components++;
        }
    }

    int find(int v) {
        if (v == parent[v]) return v;
        return parent[v] = find(parent[v]);
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a != b) {
            if (rank[a] < rank[b]) std::swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
            components--;
            return true;
        }
        return false;
    }
};

std::vector<DSU_Step> connected_components(const Graph& graph) {
    std::vector<DSU_Step> history;
    if (graph.adjacency_list.empty()) return history;

    DSU dsu;
    for (const auto& [u, _] : graph.adjacency_list) {
        dsu.make_set(u);
        for (int v : graph.adjacency_list.at(u)) dsu.make_set(v);
    }

    auto get_roots = [&]() {
        std::unordered_map<int, int> res;
        for (const auto& [node, _] : dsu.parent) {
            res[node] = dsu.find(node); 
        }
        return res;
    };

    // Шаг инициализации
    history.push_back({-1, -1, "init", false, dsu.parent, get_roots(), dsu.components});

    std::set<std::pair<int,int>> seen;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (int v : neighbors) {
            if (u > v) continue;
            if (seen.count({u, v})) continue;
            seen.insert({u, v});

            // 1. Исследование ребра
            history.push_back({u, v, "explore", false, dsu.parent, get_roots(), dsu.components});

            // 2. Попытка объединения
            bool united = dsu.unite(u, v);
            history.push_back({u, v, united ? "union" : "skip", united, dsu.parent, get_roots(), dsu.components});
        }
    }

    // Финальный шаг
    history.push_back({-1, -1, "done", false, dsu.parent, get_roots(), dsu.components});
    return history;
}