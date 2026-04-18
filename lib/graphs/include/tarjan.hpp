#pragma once

#include <vector>
#include <unordered_map>
#include <string>
#include "graph_utils.hpp"

// Структура шага алгоритма Тарьяна для визуализации
struct Tarjan_Step {
    int current_node;                                    // Текущая обрабатываемая вершина
    std::vector<int> stack;                              // Стек DFS (вершины в текущем пути)
    std::unordered_map<int, int> index_map;              // {node_id: discovery_index}
    std::unordered_map<int, int> lowlink_map;            // {node_id: lowlink_value}
    std::vector<int> on_stack_nodes;                     // Вершины, помеченные как "на стеке"
    
    int edge_from;                                       // Исходная вершина исследуемого ребра (-1 если нет)
    int edge_to;                                         // Целевая вершина исследуемого ребра (-1 если нет)
    std::string edge_type;                               // "tree", "back", "cross", "forward", "none"
    
    std::vector<std::vector<int>> completed_sccs;        // Уже найденные компоненты связности
    std::vector<int> current_scc;                        // Компонента, извлекаемая из стека сейчас (если есть)
    
    std::string action;                                  // "visit", "explore_edge", "update_lowlink", "found_scc", "done"
    int index_counter;                                   // Текущее значение счётчика индексов
};

// Основная функция алгоритма Тарьяна
// Возвращает историю шагов для пошаговой визуализации
std::vector<Tarjan_Step> tarjan_scc(const OrientedGraph& graph);