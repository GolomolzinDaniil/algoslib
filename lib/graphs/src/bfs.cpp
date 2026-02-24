#include "bfs.hpp"
#include <queue>
#include <unordered_set>
#include <stdexcept>

std::vector<BFS_Step> bfs(const Graph& graph, int start_node) {
    std::vector<BFS_Step> history;
    if (graph.adjacency_list.find(start_node) == graph.adjacency_list.end()) {
        throw std::invalid_argument("Start node does not exist in the graph.");
    }

    std::queue<int> q;
    std::unordered_set<int> visited;

    q.push(start_node);

    while (!q.empty()) {
        int current_node = q.front();
        q.pop();

        if (visited.find(current_node) != visited.end()) {
            continue;
        }

        visited.insert(current_node);

        BFS_Step step;
        step.current_node = current_node;
        step.visited = std::vector<int>(visited.begin(), visited.end());

        // копируем содержимое очереди
        std::queue<int> q_copy = q;
        while (!q_copy.empty()) {
            step.queue.push_back(q_copy.front());
            q_copy.pop();
        }

        history.push_back(step);

        for (int neighbor : graph.get_neighbors(current_node)) {
            if (visited.find(neighbor) == visited.end()) {
                q.push(neighbor);
            }
        }
    }

    return history;
}
