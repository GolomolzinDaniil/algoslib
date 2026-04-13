#include "kruskal.hpp"
#include "graph_utils.hpp"

#include <algorithm>
#include <tuple>
#include <unordered_map>
#include <vector>

// Union-Find (Disjoint Set Union)
class DSU {
public:
    std::unordered_map<int, int> parent;
    std::unordered_map<int, int> rank;

    void make_set(int v) {
        parent[v] = v;
        rank[v] = 0;
    }

    int find(int v) {
        if (parent[v] != v) {
            parent[v] = find(parent[v]); // сжатие пути
        }
        return parent[v];
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false; // уже в одной компоненте

        // объединение по рангу
        if (rank[a] < rank[b]) std::swap(a, b);
        parent[b] = a;
        if (rank[a] == rank[b]) rank[a]++;
        return true;
    }

    // Получить компоненту для каждой вершины
    std::unordered_map<int, int> get_components() {
        std::unordered_map<int, int> components;
        for (auto& [v, _] : parent) {
            components[v] = find(v);
        }
        return components;
    }
};

std::vector<Kruskal_Step> kruskal(const Weighted_Graph& graph) {
    std::vector<Kruskal_Step> history;

    // Извлекаем все рёбра (без дубликатов: берём только u < v)
    std::vector<std::tuple<int, int, double>> edges;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (const auto& [v, weight] : neighbors) {
            if (u < v) {
                edges.emplace_back(u, v, weight);
            }
        }
    }

    // Сортируем рёбра по весу
    std::sort(edges.begin(), edges.end(),
        [](const auto& a, const auto& b) {
            return std::get<2>(a) < std::get<2>(b);
        });

    // Инициализация DSU
    DSU dsu;
    for (const auto& [node, _] : graph.adjacency_list) {
        dsu.make_set(node);
    }

    std::vector<std::tuple<int, int, double>> mst_edges;
    double total_weight = 0.0;

    // Основной цикл Краскала
    for (const auto& [u, v, weight] : edges) {
        bool accepted = dsu.unite(u, v);

        if (accepted) {
            mst_edges.emplace_back(u, v, weight);
            total_weight += weight;
        }

        Kruskal_Step step;
        step.edge_from = u;
        step.edge_to = v;
        step.edge_weight = weight;
        step.accepted = accepted;
        step.mst_edges = mst_edges;
        step.total_weight = total_weight;
        step.components = dsu.get_components();
        history.push_back(step);
    }

    return history;
}
