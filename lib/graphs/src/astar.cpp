// astar.cpp
#include "astar.hpp"
#include <queue>
#include <cmath>
#include <algorithm>
#include <limits>

// Эвристика: евклидово расстояние (если заданы координаты)
static double euclidean_heuristic(
    int a, int b,
    const std::unordered_map<int, std::pair<double, double>>& coords
) {
    if (coords.count(a) == 0 || coords.count(b) == 0) return 0.0;
    const auto& [ax, ay] = coords.at(a);
    const auto& [bx, by] = coords.at(b);
    return std::hypot(ax - bx, ay - by);
}

// Сравнение для priority_queue (мин-куча по f-score)
struct CompareF {
    bool operator()(const std::pair<int, double>& a, const std::pair<int, double>& b) {
        return a.second > b.second;  // минимальный f первым
    }
};

// Создание снимка состояния для визуализации
static AStar_Step make_step(
    int current,
    const std::vector<int>& open_vec,
    const std::vector<int>& closed_vec,
    const std::unordered_map<int, double>& g,
    const std::unordered_map<int, double>& h,
    const std::unordered_map<int, double>& f,
    const std::unordered_map<int, int>& parent,
    int edge_from, int edge_to,
    const std::vector<int>& path,
    bool found,
    const std::string& action
) {
    AStar_Step step;
    step.current_node = current;
    step.open_set = open_vec;
    step.closed_set = closed_vec;
    step.g_scores = g;
    step.h_scores = h;
    step.f_scores = f;
    step.came_from = parent;
    step.edge_from = edge_from;
    step.edge_to = edge_to;
    step.current_path = path;
    step.path_found = found;
    step.action = action;
    return step;
}

std::vector<AStar_Step> astar_pathfinding(
    const Directed_Weighted_Graph& graph,
    int start,
    int goal,
    const std::unordered_map<int, std::pair<double, double>>& node_coords
) {
    std::vector<AStar_Step> history;
    
    if (!graph.adjacency_list.count(start) || !graph.adjacency_list.count(goal)) {
        return history;
    }
    
    // Инициализация
    std::priority_queue<std::pair<int, double>, std::vector<std::pair<int, double>>, CompareF> open_pq;
    std::unordered_map<int, bool> in_open;
    std::unordered_map<int, bool> in_closed;
    std::unordered_map<int, double> g_score;
    std::unordered_map<int, double> h_score;
    std::unordered_map<int, double> f_score;
    std::unordered_map<int, int> came_from;
    
    for (const auto& [node, _] : graph.adjacency_list) {
        g_score[node] = std::numeric_limits<double>::infinity();
        h_score[node] = euclidean_heuristic(node, goal, node_coords);
    }
    
    g_score[start] = 0.0;
    f_score[start] = h_score[start];
    open_pq.push({start, f_score[start]});
    in_open[start] = true;
    
    history.push_back(make_step(
        start, {start}, {}, g_score, h_score, f_score, came_from,
        -1, -1, {start}, false, "init"
    ));
    
    while (!open_pq.empty()) {
        // Извлекаем вершину с минимальным f
        int current = open_pq.top().first;
        open_pq.pop();
        in_open[current] = false;
        
        // Проверка на цель
        if (current == goal) {
            // Восстанавливаем путь
            std::vector<int> path;
            for (int at = goal; came_from.count(at); at = came_from[at]) {
                path.push_back(at);
            }
            path.push_back(start);
            std::reverse(path.begin(), path.end());
            
            history.push_back(make_step(
                current, {}, {}, g_score, h_score, f_score, came_from,
                -1, -1, path, true, "found"
            ));
            return history;
        }
        
        if (in_closed[current]) continue;
        in_closed[current] = true;
        
        // Записываем шаг: вершина обработана
        std::vector<int> open_vec, closed_vec;
        for (const auto& [n, flag] : in_open) if (flag) open_vec.push_back(n);
        for (const auto& [n, flag] : in_closed) if (flag) closed_vec.push_back(n);
        
        history.push_back(make_step(
            current, open_vec, closed_vec, g_score, h_score, f_score, came_from,
            -1, -1, {}, false, "expand"
        ));
        
        // Исследуем соседей
        for (const auto& [neighbor, weight] : graph.get_neighbors(current)) {
            if (in_closed[neighbor]) continue;
            
            history.push_back(make_step(
                current, open_vec, closed_vec, g_score, h_score, f_score, came_from,
                current, neighbor, {}, false, "explore_edge"
            ));
            
            double tentative_g = g_score[current] + weight;
            
            if (tentative_g < g_score[neighbor]) {
                // Релаксация: нашли лучший путь
                came_from[neighbor] = current;
                g_score[neighbor] = tentative_g;
                f_score[neighbor] = tentative_g + h_score[neighbor];
                
                history.push_back(make_step(
                    current, open_vec, closed_vec, g_score, h_score, f_score, came_from,
                    current, neighbor, {}, false, "relax"
                ));
                
                if (!in_open[neighbor]) {
                    open_pq.push({neighbor, f_score[neighbor]});
                    in_open[neighbor] = true;
                }
            }
        }
    }
    
    // Путь не найден
    history.push_back(make_step(
        -1, {}, {}, g_score, h_score, f_score, came_from,
        -1, -1, {}, false, "no_path"
    ));
    return history;
}