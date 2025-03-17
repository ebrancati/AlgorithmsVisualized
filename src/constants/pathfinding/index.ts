import { AlgorithmType, AlgorithmInfo } from "../../types/pathfinding";

export const GRID_COLS = 20;
export const GRID_ROWS = 10;
export const ANIMATION_SPEED = 30;

export const ALGORITHM_INFO: Record<AlgorithmType, AlgorithmInfo> = {
  "dijkstra": {
    name: "Dijkstra's",
    description: "Dijkstra's algorithm is a fundamental shortest-path algorithm used to find the most efficient routes from a single source to all other nodes in a weighted graph. By systematically exploring nodes and updating the shortest known distances, it ensures optimal path selection.",
    complexity: "The time complexity of Dijkstra's algorithm depends on the data structure used for the priority queue. With a <strong>binary heap</strong>, it runs in <strong>O((V + E) log V)</strong>, where <strong>V</strong> is the number of vertices and <strong>E</strong> is the number of edges."
  },
  "astar": {
    name: "A*",
    description: "The A* algorithm is a widely used search technique in AI, robotics, and gaming for finding the shortest path between two points. By intelligently balancing actual path costs and heuristic estimates, A* efficiently explores complex environments.",
    complexity: "A* follows the formula <strong>f(n) = g(n) + h(n)</strong>, where <strong>g(n)</strong> represents the cost from the start to the current node, and <strong>h(n)</strong> is the estimated cost to the goal. The time complexity is <strong>O(b^d)</strong> in the worst case, where <strong>b</strong> is the branching factor and <strong>d</strong> is the depth of the solution. However, with an accurate heuristic function, A* can dramatically reduce the number of explored nodes compared to uninformed search algorithms."
  },
  "depth-first-search": {
    name: "Depth-First Search",
    description: "Depth-First Search (DFS) is a powerful graph traversal algorithm that explores each branch as deeply as possible before backtracking. It is essential in computer science for applications such as cycle detection, topological sorting, and maze solving.",
    complexity: "The time complexity of DFS is <strong>O(V + E)</strong>, where <strong>V</strong> is the number of vertices and <strong>E</strong> is the number of edges, as each vertex and edge is visited once."
  },
  "bidirectional": {
    name: "Bidirectional",
    description: "Bidirectional Search is an efficient graph traversal technique that explores paths from both the start and goal nodes simultaneously. By advancing in both directions, it reduces the number of explored nodes compared to traditional unidirectional search methods.",
    complexity: "The time complexity of Bidirectional Search is <strong>O(b^(d/2))</strong>, where <strong>b</strong> is the branching factor and d is the shortest path depth. This is significantly better than unidirectional search, which operates at <strong>O(b^d)</strong>."
  }
};