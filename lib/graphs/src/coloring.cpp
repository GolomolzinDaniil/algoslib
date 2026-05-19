// coloring.cpp
#include "coloring.hpp"
#include <algorithm>
#include <set>

std::vector<ColoringStep> greedy_coloring(const Graph& graph) {
    std::vector<ColoringStep> history;
    if (graph.adjacency_list.empty()) return history;

    std::unordered_map<int, int> color_assignment;
    std::set<int> all_nodes;
    for (const auto& [u, _] : graph.adjacency_list) {
        all_nodes.insert(u);
        for (int v : graph.adjacency_list.at(u)) all_nodes.insert(v);
    }

    // Инициализация
    ColoringStep init;
    init.current_node = -1;
    init.color_assignment = {};
    init.used_colors = 0;
    init.conflict = false;
    init.available_colors = {0};
    init.action = "init";
    history.push_back(init);

    // Обрабатываем вершины в порядке возрастания (для детерминизма)
    std::vector<int> nodes(all_nodes.begin(), all_nodes.end());
    std::sort(nodes.begin(), nodes.end());

    for (int u : nodes) {
        // Собираем цвета соседей
        std::unordered_set<int> neighbor_colors;
        for (int v : graph.get_neighbors(u)) {
            if (color_assignment.count(v)) {
                neighbor_colors.insert(color_assignment[v]);
            }
        }

        // Шаг: проверка конфликтов
        ColoringStep check;
        check.current_node = u;
        check.color_assignment = color_assignment;
        check.used_colors = 0;
        check.conflict = false;
        check.action = "conflict_check";
        for (int c : neighbor_colors) check.available_colors.push_back(c);
        std::sort(check.available_colors.begin(), check.available_colors.end());
        history.push_back(check);

        // Находим минимальный доступный цвет
        int color = 0;
        while (neighbor_colors.count(color)) color++;

        // Доступные цвета для визуализации
        std::vector<int> available;
        for (int c = 0; c <= color; c++) {
            if (!neighbor_colors.count(c)) available.push_back(c);
        }

        // Шаг: назначение цвета
        color_assignment[u] = color;
        
        // ✅ ИСПРАВЛЕНО: используем ->second для итератора
        int max_color = 0;
        if (!color_assignment.empty()) {
            auto it = std::max_element(
                color_assignment.begin(), color_assignment.end(),
                [](const auto& a, const auto& b) { return a.second < b.second; }
            );
            max_color = it->second;  // ✅ Правильный доступ к значению пары
        }
        
        ColoringStep assign;
        assign.current_node = u;
        assign.color_assignment = color_assignment;
        assign.used_colors = max_color + 1;
        assign.conflict = false;
        assign.available_colors = available;
        assign.action = "assign";
        history.push_back(assign);
    }

    // Финальный шаг
    ColoringStep done;
    done.current_node = -1;
    done.color_assignment = color_assignment;
    done.used_colors = 0;
    
    // ✅ ИСПРАВЛЕНО: тот же фикс для финального шага
    if (!color_assignment.empty()) {
        auto it = std::max_element(
            color_assignment.begin(), color_assignment.end(),
            [](const auto& a, const auto& b) { return a.second < b.second; }
        );
        done.used_colors = it->second + 1;
    }
    
    done.conflict = false;
    done.action = "done";
    history.push_back(done);

    return history;
}