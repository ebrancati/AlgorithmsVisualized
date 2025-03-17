// Types for the Pathfinding Visualizer

export interface Cell {
    x: number;
    y: number;
    type: string;
}

export interface CellWithDistance extends Cell {
    distance: number;
}

export interface CellWithAStarProps extends Cell {
    g: number;
    f: number;
}

export type AlgorithmType = "dijkstra" | "astar" | "bidirectional" | "depth-first-search";

export interface AlgorithmInfo {
    name: string;
    description: string;
    complexity: string;
}

export interface Stats {
    visitedCells: number;
    pathDistance: number;
    elapsedTime: number;
    isRunning: boolean;
}

export type GridType = Cell[][];

export interface GridConfig {
    cols: number;
    rows: number;
    animationSpeed: number;
}