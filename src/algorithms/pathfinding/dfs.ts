import { Cell } from '../../types/pathfinding';
import { getNeighbors } from '../../utils/pathfinding/grid';
import { reconstructPath } from '../../utils/pathfinding/pathReconstruction';
import { AlgorithmRunnerProps, AlgorithmResult } from './index';
export const dfs = async ({
    grid,
    start,
    end,
    visitNode,
    isRunningRef,
    setStats,
    setGrid,
    animationSpeed
}: AlgorithmRunnerProps): Promise<AlgorithmResult | null> => {
    if (!start || !end) return null;
   
    const stack = [{ ...start, distance: 0 }];
    const cameFrom = new Map<string, Cell>();
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);
    let visitedCount = 0;
    while (stack.length > 0 && isRunningRef.current) {
        const current = stack.pop()!;
        if (current.x === end.x && current.y === end.y) {
            // First, stop the timer immediately when target is found
            if (isRunningRef.current) {
                setStats(prevStats => ({
                    ...prevStats,
                    isRunning: false // Stop the timer here
                }));
            }
            
            // Then reconstruct and visualize the path
            const path = await reconstructPath(
                current,
                cameFrom,
                grid,
                setGrid,
                isRunningRef,
                animationSpeed,
                end
            );
           
            // After path visualization, update only the path distance
            if (isRunningRef.current) {
                setStats(prevStats => ({
                    ...prevStats,
                    pathDistance: path.length - 1
                    // isRunning is not included here
                }));
            }
           
            return {
                success: true,
                path,
                visitedCount
            };
        }
        // Process all neighbors in depth-first manner
        for (const neighbor of getNeighbors(current, grid)) {
            // Check if algorithm should stop before potentially expensive operations
            if (!isRunningRef.current) {
                return null;
            }
           
            if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
                visited.add(`${neighbor.x},${neighbor.y}`);
                cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
                stack.push({ ...neighbor, distance: current.distance + 1 });
               
                // Check if the algorithm should still be running
                if (isRunningRef.current) {
                    await visitNode(neighbor);
                    visitedCount++;
                    setStats(prevStats => ({
                        ...prevStats,
                        visitedCells: visitedCount
                    }));
                } else {
                    return null; // Exit early if algorithm should stop
                }
            }
        }
    }
    // If the algorithm is still running and we have exhausted all possibilities,
    // it means that there is no path to the destination
    if (isRunningRef.current) {
        setStats(prev => ({
            ...prev,
            isRunning: false,
            pathDistance: -1
        }));
    }
   
    // No path found
    return {
        success: false,
        path: [],
        visitedCount
    };
};