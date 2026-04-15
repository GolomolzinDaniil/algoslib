#pragma once

#include <vector>
#include "graph_utils.hpp"

// структура для шагов алгоритма Сталин-сорта для графов
struct Stalin_Step {
    int current_node;           // Вершина, которую сейчас рассматриваем
    bool accepted;              // Принята ли вершина в клику
    int conflict_with;          // Если отклонена — с какой вершиной конфликт (-1 если нет)
    std::vector<int> clique;    // Текущая клика (оставленные вершины)
    std::vector<int> exiled;    // Отправленные в ссылку вершины
};

std::vector<Stalin_Step> stalin_sort(const Graph& graph);
