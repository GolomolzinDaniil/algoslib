#include "tarjan.hpp"
#include <algorithm>
#include <stack>

// Вспомогательная функция для создания снимка состояния
static Tarjan_Step make_step(
    int current_node,
    const std::stack<int>& dfs_stack,
    const std::unordered_map<int, int>& index_map,
    const std::unordered_map<int, int>& lowlink_map,
    const std::unordered_map<int, bool>& on_stack,
    int edge_from,
    int edge_to,
    const std::string& edge_type,
    const std::vector<std::vector<int>>& completed_sccs,
    const std::vector<int>& current_scc,
    const std::string& action,
    int index_counter
) {
    Tarjan_Step step;
    step.current_node = current_node;
    
    // Копируем стек
    std::stack<int> temp_stack = dfs_stack;
    while (!temp_stack.empty()) {
        step.stack.insert(step.stack.begin(), temp_stack.top());
        temp_stack.pop();
    }
    
    step.index_map = index_map;
    step.lowlink_map = lowlink_map;
    
    // Копируем on_stack
    for (const auto& [node, flag] : on_stack) {
        if (flag) step.on_stack_nodes.push_back(node);
    }
    
    step.edge_from = edge_from;
    step.edge_to = edge_to;
    step.edge_type = edge_type;
    step.completed_sccs = completed_sccs;
    step.current_scc = current_scc;
    step.action = action;
    step.index_counter = index_counter;
    
    return step;
}

// Рекурсивная функция strongconnect с записью шагов
static void strongconnect(
    int v,
    const OrientedGraph& graph,
    int& index_counter,
    std::unordered_map<int, int>& index_map,
    std::unordered_map<int, int>& lowlink_map,
    std::stack<int>& S,
    std::unordered_map<int, bool>& on_stack,
    std::vector<std::vector<int>>& all_sccs,
    std::vector<Tarjan_Step>& history,
    std::vector<std::vector<int>>& completed_sccs_snapshot
) {
    // Шаг 1: Посещение новой вершины
    index_map[v] = index_counter;
    lowlink_map[v] = index_counter;
    index_counter++;
    S.push(v);
    on_stack[v] = true;
    
    history.push_back(make_step(
        v, S, index_map, lowlink_map, on_stack,
        -1, -1, "none", completed_sccs_snapshot, {}, "visit", index_counter
    ));
    
    // Исследуем соседей
    for (int w : graph.get_neighbors(v)) {
        // Шаг 2: Исследование ребра
        history.push_back(make_step(
            v, S, index_map, lowlink_map, on_stack,
            v, w, "exploring", completed_sccs_snapshot, {}, "explore_edge", index_counter
        ));
        
        if (index_map.find(w) == index_map.end()) {
            // Ребро дерева (tree edge)
            history.push_back(make_step(
                v, S, index_map, lowlink_map, on_stack,
                v, w, "tree", completed_sccs_snapshot, {}, "explore_edge", index_counter
            ));
            
            strongconnect(
                w, graph, index_counter, index_map, lowlink_map,
                S, on_stack, all_sccs, history, completed_sccs_snapshot
            );
            
            // Обновляем lowlink после возврата из рекурсии
            lowlink_map[v] = std::min(lowlink_map[v], lowlink_map[w]);
            
            history.push_back(make_step(
                v, S, index_map, lowlink_map, on_stack,
                v, w, "tree", completed_sccs_snapshot, {}, "update_lowlink", index_counter
            ));
            
        } else if (on_stack[w]) {
            // Обратное ребро (back edge) — часть цикла
            history.push_back(make_step(
                v, S, index_map, lowlink_map, on_stack,
                v, w, "back", completed_sccs_snapshot, {}, "explore_edge", index_counter
            ));
            
            lowlink_map[v] = std::min(lowlink_map[v], index_map[w]);
            
            history.push_back(make_step(
                v, S, index_map, lowlink_map, on_stack,
                v, w, "back", completed_sccs_snapshot, {}, "update_lowlink", index_counter
            ));
        } else {
            // Поперечное или прямое ребро (не влияет на lowlink)
            history.push_back(make_step(
                v, S, index_map, lowlink_map, on_stack,
                v, w, "cross", completed_sccs_snapshot, {}, "explore_edge", index_counter
            ));
        }
    }
    
    // Если v — корень компоненты связности
    if (lowlink_map[v] == index_map[v]) {
        std::vector<int> scc;
        int w;
        do {
            w = S.top();
            S.pop();
            on_stack[w] = false;
            scc.push_back(w);
        } while (w != v);
        
        // Шаг 3: Извлечение компоненты из стека
        history.push_back(make_step(
            v, S, index_map, lowlink_map, on_stack,
            -1, -1, "none", completed_sccs_snapshot, scc, "found_scc", index_counter
        ));
        
        all_sccs.push_back(scc);
        completed_sccs_snapshot = all_sccs; // Обновляем снимок для следующих шагов
    }
}

std::vector<Tarjan_Step> tarjan_scc(const OrientedGraph& graph) {
    std::vector<Tarjan_Step> history;
    
    if (graph.adjacency_list.empty()) {
        return history;
    }
    
    int index_counter = 0;
    std::unordered_map<int, int> index_map;
    std::unordered_map<int, int> lowlink_map;
    std::stack<int> S;
    std::unordered_map<int, bool> on_stack;
    std::vector<std::vector<int>> all_sccs;
    std::vector<std::vector<int>> completed_sccs_snapshot;
    
    // Запускаем DFS для каждой непосещённой вершины
    for (const auto& [node, neighbors] : graph.adjacency_list) {
        if (index_map.find(node) == index_map.end()) {
            strongconnect(
                node, graph, index_counter, index_map, lowlink_map,
                S, on_stack, all_sccs, history, completed_sccs_snapshot
            );
        }
    }
    
    // Финальный шаг
    history.push_back(make_step(
        -1, S, index_map, lowlink_map, on_stack,
        -1, -1, "none", all_sccs, {}, "done", index_counter
    ));
    
    return history;
}