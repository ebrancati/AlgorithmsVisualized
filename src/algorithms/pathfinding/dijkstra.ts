import { Cell } from '../../types/pathfinding';
import { getNeighbors } from '../../utils/pathfinding/grid';
import { reconstructPath } from '../../utils/pathfinding/pathReconstruction';
import { AlgorithmRunnerProps, AlgorithmResult } from './index';
export const dijkstra = async ({
    grid,
    start,
    end,
    visitNode,
    isRunningRef,
    setStats,
    setGrid,
    animationSpeed
}: AlgorithmRunnerProps): Promise<AlgorithmResult> => {
    if (!start || !end) {
        return { success: false, path: [], visitedCount: 0 };
    }
   
    const openSet = [{ ...start, distance: 0 }];
    const cameFrom = new Map<string, Cell>();
    const distances = new Map<string, number>();
    distances.set(`${start.x},${start.y}`, 0);
    let visitedCount = 0;
    while (openSet.length > 0 && isRunningRef.current) {
        openSet.sort((a, b) => a.distance - b.distance);
        const current = openSet.shift()!;
        if (current.x === end.x && current.y === end.y) {
            // First, stop the timer immediately when target is found
            if (isRunningRef.current) {
                setStats(prev => ({
                    ...prev,
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
                setStats(prev => ({
                    ...prev,
                    pathDistance: path.length - 1
                    // isRunning is not included here
                }));
            }
           
            return { success: true, path, visitedCount };
        }
        for (const neighbor of getNeighbors(current, grid)) {
            const newDistance = distances.get(`${current.x},${current.y}`)! + 1;
           
            if (!distances.has(`${neighbor.x},${neighbor.y}`) ||
                newDistance < distances.get(`${neighbor.x},${neighbor.y}`)!) {
               
                cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
                distances.set(`${neighbor.x},${neighbor.y}`, newDistance);
               
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push({ ...neighbor, distance: newDistance });
                   
                    // Check if the operation was interrupted
                    if (!isRunningRef.current) {
                        return { success: false, path: [], visitedCount };
                    }
                   
                    await visitNode(neighbor);
                    visitedCount++;
                    setStats(prev => ({
                        ...prev,
                        visitedCells: visitedCount
                    }));
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