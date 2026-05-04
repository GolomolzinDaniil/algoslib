#pragma once
#include <vector>
#include <unordered_map>
#include <string>
#include "graph_utils.hpp"

struct TopoStep {
    std::vector<int> result_order;
    std::vector<int> zero_indegree_queue;
    std::unordered_map<int, int> in_degree;
    int processed_node;
    int edge_from;
    int edge_to;
    std::string action; // "init", "select", "explore", "update", "enqueue", "cycle", "done"
    bool has_cycle;
};

std::vector<TopoStep> topological_sort(const OrientedGraph& graph);