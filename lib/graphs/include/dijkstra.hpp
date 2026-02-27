#pragma once

#include <vector>
#include "graph_utils.hpp"


std::vector<Dijkstra_Step> dijkstra(const Weighted_Graph& graph, int start_node);