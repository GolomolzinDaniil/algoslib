#pragma once

#include <tuple>
#include <vector>

#include "graph_utils.hpp"

struct Prim_Step {
    int current_node;
    int edge_from;
    int edge_to;
    double edge_weight;
    bool accepted;
    std::vector<int> visited;
    std::vector<int> queue;
    std::vector<std::tuple<int, int, double>> mst_edges;
    double total_weight;
};

std::vector<Prim_Step> prim(const Weighted_Graph& graph, int start_node);
