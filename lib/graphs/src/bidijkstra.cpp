// bidijkstra.cpp
#include "bidijkstra.hpp"
#include <queue>
#include <algorithm>
#include <limits>

struct CompareDist {
    bool operator()(const std::pair<int, double>& a, const std::pair<int, double>& b) {
        return a.second > b.second;
    }
};

static BiDijkstra_Step make_step(
    int phase, int current,
    const std::vector<int>& f_open, const std::vector<int>& f_closed,
    const std::vector<int>& b_open, const std::vector<int>& b_closed,
    const std::unordered_map<int, double>& f_dist, const std::unordered_map<int, double>& b_dist,
    const std::unordered_map<int, int>& f_par, const std::unordered_map<int, int>& b_par,
    int ef, int et, const std::string& act, bool found,
    const std::vector<int>& path, double cost
) {
    BiDijkstra_Step s;
    s.phase = phase; s.current_node = current;
    s.forward_open = f_open; s.forward_closed = f_closed;
    s.backward_open = b_open; s.backward_closed = b_closed;
    s.forward_dist = f_dist; s.backward_dist = b_dist;
    s.forward_parent = f_par; s.backward_parent = b_par;
    s.edge_from = ef; s.edge_to = et;
    s.action = act; s.path_found = found;
    s.current_path = path; s.total_cost = cost;
    return s;
}

std::vector<BiDijkstra_Step> bidijkstra(const Directed_Weighted_Graph& graph, int source, int target) {
    std::vector<BiDijkstra_Step> history;
    if (!graph.adjacency_list.count(source) || !graph.adjacency_list.count(target)) return history;
    if (source == target) {
        history.push_back(make_step(3, source, {}, {source}, {}, {target},
            {{source,0}}, {{target,0}}, {}, {}, -1, -1, "init", true, {source}, 0.0));
        return history;
    }

    // Обратный граф
    Directed_Weighted_Graph rev_graph;
    for (const auto& [u, neighbors] : graph.adjacency_list) {
        for (const auto& [v, w] : neighbors) {
            rev_graph.add_edge(v, u, w);
        }
    }

    // Состояние
    std::priority_queue<std::pair<int,double>, std::vector<std::pair<int,double>>, CompareDist> pq_fwd, pq_bwd;
    std::unordered_map<int, double> dist_fwd, dist_bwd;
    std::unordered_map<int, int> par_fwd, par_bwd;
    std::unordered_map<int, bool> closed_fwd, closed_bwd;
    std::unordered_map<int, bool> in_open_fwd, in_open_bwd;

    for (const auto& [n, _] : graph.adjacency_list) {
        dist_fwd[n] = dist_bwd[n] = std::numeric_limits<double>::infinity();
    }

    dist_fwd[source] = 0.0; dist_bwd[target] = 0.0;
    pq_fwd.push({source, 0.0}); pq_bwd.push({target, 0.0});
    in_open_fwd[source] = true; in_open_bwd[target] = true;

    auto get_open_vec = [](const std::priority_queue<std::pair<int,double>, std::vector<std::pair<int,double>>, CompareDist>& pq,
                           const std::unordered_map<int, bool>& in_open) {
        std::vector<int> res;
        // Копируем очередь для итерации (без потери данных)
        auto temp = pq;
        while(!temp.empty()) { res.push_back(temp.top().first); temp.pop(); }
        // Фильтруем только те, что действительно в open set
        std::vector<int> filtered;
        for(int n : res) if(in_open.count(n) && in_open.at(n)) filtered.push_back(n);
        return filtered;
    };

    auto get_closed_vec = [](const std::unordered_map<int, bool>& closed) {
        std::vector<int> res;
        for(const auto& [n, v] : closed) if(v) res.push_back(n);
        return res;
    };

    history.push_back(make_step(1, source, get_open_vec(pq_fwd, in_open_fwd), {}, get_open_vec(pq_bwd, in_open_bwd), {},
        dist_fwd, dist_bwd, par_fwd, par_bwd, -1, -1, "init", false, {}, std::numeric_limits<double>::infinity()));

    double meet_cost = std::numeric_limits<double>::infinity();
    int meet_node = -1;

    while (!pq_fwd.empty() && !pq_bwd.empty()) {
        // Выбираем направление с минимальным d
        bool forward_turn = pq_fwd.top().second <= pq_bwd.top().second;

        auto& pq = forward_turn ? pq_fwd : pq_bwd;
        auto& dist = forward_turn ? dist_fwd : dist_bwd;
        auto& par = forward_turn ? par_fwd : par_bwd;
        auto& closed = forward_turn ? closed_fwd : closed_bwd;
        auto& in_open = forward_turn ? in_open_fwd : in_open_bwd;
        auto& other_closed = forward_turn ? closed_bwd : closed_fwd;
        auto& other_dist = forward_turn ? dist_bwd : dist_fwd;
        const auto& g = forward_turn ? graph : rev_graph;

        int u = pq.top().first; pq.pop();
        in_open[u] = false;

        if (closed[u]) continue;
        closed[u] = true;

        const std::string act = forward_turn ? "forward_expand" : "backward_expand";
        history.push_back(make_step(forward_turn ? 1 : 2, u,
            get_open_vec(pq_fwd, in_open_fwd), get_closed_vec(closed_fwd),
            get_open_vec(pq_bwd, in_open_bwd), get_closed_vec(closed_bwd),
            dist_fwd, dist_bwd, par_fwd, par_bwd,
            -1, -1, act, false, {}, meet_cost));

        // Проверка встречи
        if (other_closed.count(u) && other_closed.at(u)) {
            double potential = dist[u] + other_dist[u];
            if (potential < meet_cost) {
                meet_cost = potential;
                meet_node = u;
            }
        }

        for (const auto& [v, w] : g.get_neighbors(u)) {
            if (closed[v]) continue;
            double new_dist = dist[u] + w;
            if (new_dist < dist[v]) {
                dist[v] = new_dist;
                par[v] = u;
                if (!in_open[v]) {
                    pq.push({v, new_dist});
                    in_open[v] = true;
                }
                history.push_back(make_step(forward_turn ? 1 : 2, u,
                    get_open_vec(pq_fwd, in_open_fwd), get_closed_vec(closed_fwd),
                    get_open_vec(pq_bwd, in_open_bwd), get_closed_vec(closed_bwd),
                    dist_fwd, dist_bwd, par_fwd, par_bwd,
                    u, v, "relax", false, {}, meet_cost));
            }
        }
    }

    // Встреча не найдена или пути нет
    if (meet_node == -1) {
        history.push_back(make_step(3, -1, {}, get_closed_vec(closed_fwd), {}, get_closed_vec(closed_bwd),
            dist_fwd, dist_bwd, par_fwd, par_bwd, -1, -1, "no_path", false, {}, std::numeric_limits<double>::infinity()));
        return history;
    }

    // Восстановление пути
    std::vector<int> path;
    for (int cur = meet_node; cur != source; cur = par_fwd[cur]) path.push_back(cur);
    path.push_back(source);
    std::reverse(path.begin(), path.end());
    
    std::vector<int> back_path;
    for (int cur = meet_node; cur != target; cur = par_bwd[cur]) back_path.push_back(cur);
    path.insert(path.end(), back_path.begin(), back_path.end());

    history.push_back(make_step(3, meet_node, {}, get_closed_vec(closed_fwd), {}, get_closed_vec(closed_bwd),
        dist_fwd, dist_bwd, par_fwd, par_bwd, -1, -1, "meet", true, {}, meet_cost));
    history.push_back(make_step(3, meet_node, {}, get_closed_vec(closed_fwd), {}, get_closed_vec(closed_bwd),
        dist_fwd, dist_bwd, par_fwd, par_bwd, -1, -1, "reconstruct", true, path, meet_cost));
    return history;
}