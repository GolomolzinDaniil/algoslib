#include "hierholzer.hpp"

#include <algorithm>
#include <unordered_map>
#include <vector>
#include <utility>

// Алгоритм Хирхольцера для поиска эйлерова пути или цикла в неориентированном графе.
//
// Условия существования:
//   - Эйлеров цикл: все вершины с рёбрами имеют чётную степень и граф связен по рёбрам.
//   - Эйлеров путь:  ровно две вершины имеют нечётную степень (старт и финиш) и граф связен по рёбрам.
//
// Идея алгоритма:
//   1. Стартуем из вершины с нечётной степенью (если есть) или из любой с рёбрами.
//   2. Идём по непройденным рёбрам, пока не упрёмся в тупик.
//   3. Когда соседей нет — переносим вершину из стека в результат (circuit).
//   4. В конце circuit, развёрнутый, даёт эйлеров путь/цикл.
std::vector<Hierholzer_Step> hierholzer(const Graph& graph) {
    std::vector<Hierholzer_Step> history;

    // Детерминированный порядок вершин
    std::vector<int> vertices;
    vertices.reserve(graph.adjacency_list.size());
    for (const auto& [v, _] : graph.adjacency_list) {
        vertices.push_back(v);
    }
    std::sort(vertices.begin(), vertices.end());

    // Каждому неориентированному ребру даём уникальный id
    // (учитываем только u < v, чтобы не считать ребро дважды).
    std::vector<std::pair<int, int>> edge_endpoints; // edge_id -> (u, v)
    std::unordered_map<int, std::vector<std::pair<int, int>>> incident; // node -> [(neighbor, edge_id)]

    std::unordered_map<int, int> degree;
    for (int u : vertices) {
        degree[u] = 0;
        incident[u]; // создать пустой список
    }

    for (int u : vertices) {
        for (int v : graph.adjacency_list.at(u)) {
            degree[u]++;
            if (u < v) {
                int eid = static_cast<int>(edge_endpoints.size());
                edge_endpoints.emplace_back(u, v);
                incident[u].emplace_back(v, eid);
                incident[v].emplace_back(u, eid);
            }
        }
    }

    // Подсчёт нечётных вершин
    std::vector<int> odd_vertices;
    for (int v : vertices) {
        if (degree[v] % 2 == 1) {
            odd_vertices.push_back(v);
        }
    }

    bool is_circuit = odd_vertices.empty();
    bool euler_exists = (odd_vertices.empty() || odd_vertices.size() == 2);

    std::vector<bool> used(edge_endpoints.size(), false);

    auto remaining_snapshot = [&]() {
        std::vector<std::pair<int, int>> out;
        out.reserve(edge_endpoints.size());
        for (size_t i = 0; i < edge_endpoints.size(); ++i) {
            if (!used[i]) out.push_back(edge_endpoints[i]);
        }
        return out;
    };

    // Эйлеров путь невозможен — фиксируем и выходим
    if (!euler_exists) {
        Hierholzer_Step step;
        step.current_node = -1;
        step.action = "no_path";
        step.stack = {};
        step.circuit = {};
        step.remaining_edges = remaining_snapshot();
        step.euler_exists = false;
        step.is_circuit = false;
        history.push_back(step);
        return history;
    }

    // Граф без рёбер — тривиальный случай
    if (edge_endpoints.empty()) {
        Hierholzer_Step step;
        step.current_node = vertices.empty() ? -1 : vertices.front();
        step.action = "done";
        step.stack = {};
        step.circuit = vertices.empty() ? std::vector<int>{} : std::vector<int>{vertices.front()};
        step.remaining_edges = {};
        step.euler_exists = true;
        step.is_circuit = true;
        history.push_back(step);
        return history;
    }

    // Стартовая вершина: нечётная (если есть), иначе минимальная с рёбрами
    int start = is_circuit ? -1 : odd_vertices.front();
    if (start == -1) {
        for (int v : vertices) {
            if (degree[v] > 0) { start = v; break; }
        }
    }

    // Указатели на следующее непросмотренное ребро в списке смежности каждой вершины
    std::unordered_map<int, size_t> iter;
    for (int v : vertices) iter[v] = 0;

    std::vector<int> stack = {start};
    std::vector<int> circuit;

    {
        Hierholzer_Step step;
        step.current_node = start;
        step.action = "init";
        step.stack = stack;
        step.circuit = circuit;
        step.remaining_edges = remaining_snapshot();
        step.euler_exists = true;
        step.is_circuit = is_circuit;
        history.push_back(step);
    }

    while (!stack.empty()) {
        int v = stack.back();
        auto& adj = incident[v];

        // Промотать iter[v] до следующего непройденного ребра
        while (iter[v] < adj.size() && used[adj[iter[v]].second]) {
            iter[v]++;
        }

        if (iter[v] < adj.size()) {
            auto [next, eid] = adj[iter[v]];
            used[eid] = true;
            iter[v]++;
            stack.push_back(next);

            Hierholzer_Step step;
            step.current_node = next;
            step.action = "push";
            step.stack = stack;
            step.circuit = circuit;
            step.remaining_edges = remaining_snapshot();
            step.euler_exists = true;
            step.is_circuit = is_circuit;
            history.push_back(step);
        } else {
            // Тупик — переносим в circuit
            circuit.push_back(v);
            stack.pop_back();

            Hierholzer_Step step;
            step.current_node = v;
            step.action = "pop";
            step.stack = stack;
            step.circuit = circuit;
            step.remaining_edges = remaining_snapshot();
            step.euler_exists = true;
            step.is_circuit = is_circuit;
            history.push_back(step);
        }
    }

    // Разворачиваем circuit — это и есть эйлеров путь/цикл
    std::reverse(circuit.begin(), circuit.end());

    // Если остались непройденные рёбра — граф был несвязен по рёбрам
    bool all_edges_used = std::all_of(used.begin(), used.end(), [](bool b) { return b; });

    Hierholzer_Step final_step;
    final_step.current_node = circuit.empty() ? -1 : circuit.back();
    final_step.action = all_edges_used ? "done" : "no_path";
    final_step.stack = {};
    final_step.circuit = circuit;
    final_step.remaining_edges = remaining_snapshot();
    final_step.euler_exists = all_edges_used;
    final_step.is_circuit = is_circuit && all_edges_used;
    history.push_back(final_step);

    return history;
}
