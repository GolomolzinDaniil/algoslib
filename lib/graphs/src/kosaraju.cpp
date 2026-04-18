#include "kosaraju.hpp"
#include <algorithm>
#include <stack>

// Вспомогательная функция создания шага
static Kosaraju_Step make_step(
    int phase, int current_node, const std::stack<int>& dfs_stack,
    const std::vector<int>& finish_order, const std::vector<int>& processing_order,
    int edge_from, int edge_to,
    const std::vector<std::vector<int>>& completed_sccs,
    const std::vector<int>& current_scc,
    const std::string& action, bool is_transposed = false
) {
    Kosaraju_Step step;
    step.phase = phase;
    step.current_node = current_node;
    step.edge_from = edge_from;
    step.edge_to = edge_to;
    step.action = action;
    step.is_transposed_edge = is_transposed;
    step.completed_sccs = completed_sccs;
    step.current_scc = current_scc;
    
    // Копируем стек
    std::stack<int> temp = dfs_stack;
    while (!temp.empty()) {
        step.stack.insert(step.stack.begin(), temp.top());
        temp.pop();
    }
    
    step.finish_order = finish_order;
    step.processing_order = processing_order;
    
    return step;
}

// DFS для фазы 1: заполнение finish_order
static void dfs_finish(
    int v,
    const OrientedGraph& graph,
    std::unordered_map<int, bool>& visited,
    std::stack<int>& finish_stack,
    std::vector<Kosaraju_Step>& history,
    const std::vector<std::vector<int>>& completed_sccs_snapshot
) {
    visited[v] = true;
    
    history.push_back(make_step(
        1, v, {}, {}, {}, -1, -1,
        completed_sccs_snapshot, {}, "visit"
    ));
    
    for (int w : graph.get_neighbors(v)) {
        history.push_back(make_step(
            1, v, {}, {}, {}, v, w,
            completed_sccs_snapshot, {}, "explore_edge"
        ));
        
        if (!visited[w]) {
            dfs_finish(w, graph, visited, finish_stack, history, completed_sccs_snapshot);
        }
    }
    
    finish_stack.push(v);
    history.push_back(make_step(
        1, v, {}, {}, {}, -1, -1,
        completed_sccs_snapshot, {}, "finish"
    ));
}

// DFS для фазы 3: извлечение компонент на транспонированном графе
static void dfs_scc(
    int v,
    const OrientedGraph& transposed,
    std::unordered_map<int, bool>& visited,
    std::vector<int>& current_component,
    std::vector<Kosaraju_Step>& history,
    std::vector<std::vector<int>>& all_sccs
) {
    visited[v] = true;
    current_component.push_back(v);
    
    history.push_back(make_step(
        3, v, {}, {}, {}, -1, -1,
        all_sccs, current_component, "visit"
    ));
    
    for (int w : transposed.get_neighbors(v)) {
        history.push_back(make_step(
            3, v, {}, {}, {}, v, w,
            all_sccs, current_component, "explore_edge", true  // транспонированное ребро
        ));
        
        if (!visited[w]) {
            dfs_scc(w, transposed, visited, current_component, history, all_sccs);
        }
    }
}

std::vector<Kosaraju_Step> kosaraju_scc(const OrientedGraph& graph) {
    std::vector<Kosaraju_Step> history;
    
    if (graph.adjacency_list.empty()) {
        return history;
    }
    
    // === ФАЗА 1: DFS на исходном графе, заполнение finish_order ===
    history.push_back(make_step(1, -1, {}, {}, {}, -1, -1, {}, {}, "start_dfs1"));
    
    std::unordered_map<int, bool> visited1;
    std::stack<int> finish_stack;
    std::vector<std::vector<int>> completed_sccs_snapshot;
    
    for (const auto& [node, _] : graph.adjacency_list) {
        if (!visited1[node]) {
            dfs_finish(node, graph, visited1, finish_stack, history, completed_sccs_snapshot);
        }
    }
    
    // Извлекаем finish_order из стека
    std::vector<int> finish_order;
    std::stack<int> temp_finish = finish_stack;
    while (!temp_finish.empty()) {
        finish_order.push_back(temp_finish.top());
        temp_finish.pop();
    }
    
    // === ФАЗА 2: Транспонирование графа ===
    history.push_back(make_step(2, -1, {}, finish_order, {}, -1, -1, {}, {}, "transpose"));
    
    OrientedGraph transposed;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (int v : neighbors) {
            transposed.add_edge(v, u);  // Разворачиваем ребро: u->v становится v->u
        }
    }
    
    // Показываем несколько шагов транспонирования для наглядности
    int edge_count = 0;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (int v : neighbors) {
            if (edge_count++ < 5) {  // Ограничим количество шагов
                history.push_back(make_step(
                    2, -1, {}, finish_order, {}, u, v,
                    {}, {}, "transpose_edge", true
                ));
            }
        }
    }
    
    // === ФАЗА 3: DFS на транспонированном графе в порядке finish_order ===
    history.push_back(make_step(3, -1, {}, finish_order, finish_order, -1, -1, {}, {}, "start_dfs2"));
    
    std::unordered_map<int, bool> visited2;
    std::vector<std::vector<int>> all_sccs;
    
    // Обработка в ОБРАТНОМ порядке finish_order (с конца стека)
    while (!finish_stack.empty()) {
        int v = finish_stack.top();
        finish_stack.pop();
        
        if (!visited2[v]) {
            std::vector<int> current_component;
            dfs_scc(v, transposed, visited2, current_component, history, all_sccs);
            
            // Записываем найденную компоненту
            history.push_back(make_step(
                3, v, {}, finish_order, {}, -1, -1,
                all_sccs, current_component, "found_scc"
            ));
            
            all_sccs.push_back(current_component);
            completed_sccs_snapshot = all_sccs;
        }
    }
    
    // Финальный шаг
    history.push_back(make_step(
        3, -1, {}, finish_order, {}, -1, -1,
        all_sccs, {}, "done"
    ));
    
    return history;
}