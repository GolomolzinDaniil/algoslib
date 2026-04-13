#pragma once

#include <unordered_map>
#include <vector>
#include <queue>
#include "graph_utils.hpp"

struct FordFulkerson_Step {
    int iteration;                          
    std::vector<int> augmenting_path;       
    double flow_increase;                   
    double total_flow;                     
    std::unordered_map<int, std::unordered_map<int, double>> residual_capacities; 
};

struct FordFulkerson_Result {
    double max_flow;                                                   
    std::unordered_map<int, std::unordered_map<int, double>> flow;     
    std::vector<FordFulkerson_Step> history;                         
};

FordFulkerson_Result ford_fulkerson(const Flow_Graph& graph, int source, int sink);