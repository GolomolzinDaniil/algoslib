#pragma once

#include <unordered_map>
#include <vector>
#include <queue>


struct Flow_Graph;

struct EdmondsKarp_Step {
    int iteration;
    std::vector<int> augmenting_path;
    double flow_increase;
    double total_flow;
    std::unordered_map<int, std::unordered_map<int, double>> residual_capacities;
};

struct EdmondsKarp_Result {
    double max_flow;
    std::unordered_map<int, std::unordered_map<int, double>> flow;
    std::vector<EdmondsKarp_Step> history;
};

EdmondsKarp_Result edmonds_karp(const Flow_Graph& graph, int source, int sink);