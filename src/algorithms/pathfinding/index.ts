import { Cell, GridType, Stats } from '../../types/pathfinding';
import { RefObject, Dispatch, SetStateAction } from 'react';
import { dijkstra } from './dijkstra';
import { astar } from './astar';
import { dfs } from './dfs';
import { bidirectional } from './bidirectional';

export type VisitNodeCallback = (node: Cell) => Promise<void>;

// Define an interface for the stats object
export interface AlgorithmStats {
    isRunning: boolean;
    visitedCells: number;
    pathDistance: number;
}

export interface AlgorithmRunnerProps {
    grid: GridType;
    start: Cell;
    end: Cell;
    visitNode: VisitNodeCallback;
    isRunningRef: RefObject<boolean>;
    setStats: Dispatch<SetStateAction<Stats>>; 
    setGrid: (grid: GridType | ((prevGrid: GridType) => GridType)) => void;
    animationSpeed: number;
}

export interface AlgorithmResult {
    success: boolean;
    path: Cell[];
    visitedCount: number;
}

export { dijkstra, astar, dfs, bidirectional };