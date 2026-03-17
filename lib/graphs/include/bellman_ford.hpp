#pragma once

#include <vector>
#include "graph_utils.hpp"


std::vector<Ford_Step> bellman_ford(const Weighted_Graph& graph, int start_node);