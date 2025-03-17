import { Cell, GridType } from '../../types/pathfinding';

/**
 * Creates a new empty grid with the specified dimensions
 */
export const createGrid = (rows: number, cols: number): GridType => 
    Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => ({ x, y, type: "empty" }))
    );

/**
 * Gets valid neighboring cells for a node in the grid
 */
export const getNeighbors = (node: Cell, grid: GridType): Cell[] => {
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }, // Left
        { x: 1, y: 0 }   // Right
    ];

    return directions
        .map(d => ({ x: node.x + d.x, y: node.y + d.y, type: "empty" }))
        .filter(n => 
            n.x >= 0 && n.x < grid[0].length && 
            n.y >= 0 && n.y < grid.length && 
            grid[n.y][n.x].type !== "wall"
        );
};

/**
 * Calculates Manhattan distance between two cells
 */
export const heuristic = (a: Cell, b: Cell): number => 
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/**
 * Resets the path and visited cells in the grid
 */
export const resetPathAndVisited = (grid: GridType): GridType =>
    grid.map(row =>
        row.map(cell => {
            if (cell.type === "visited" || cell.type === "path") {
                return { ...cell, type: "empty" };
            }
            return cell;
        })
    );

/**
 * Formats time in seconds with milliseconds
 */
export const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
};