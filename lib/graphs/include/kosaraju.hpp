#pragma once

#include <vector>
#include <string>
#include "graph_utils.hpp"

// Структура шага алгоритма Косараджу для визуализации
struct Kosaraju_Step {
    int phase;                                          // 1: DFS исходный, 2: транспонирование, 3: DFS транспонированный
    int current_node;                                   // Текущая вершина
    std::vector<int> stack;                             // Стек DFS
    std::vector<int> finish_order;                      // Порядок завершения (после фазы 1)
    std::vector<int> processing_order;                  // Порядок обработки в фазе 3 (обратный finish_order)
    
    int edge_from;                                      // Исследуемое ребро: from
    int edge_to;                                        // Исследуемое ребро: to
    
    std::vector<std::vector<int>> completed_sccs;       // Уже найденные компоненты
    std::vector<int> current_scc;                       // Компонента, извлекаемая сейчас
    
    std::string action;                                 // "start_dfs1", "visit", "finish", "transpose", "start_dfs2", "found_scc", "done"
    bool is_transposed_edge;                            // Показывать ли ребро как "развёрнутое"
};

std::vector<Kosaraju_Step> kosaraju_scc(const OrientedGraph& graph);