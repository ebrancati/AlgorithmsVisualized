import { Cell } from '../../types/pathfinding';
import { getNeighbors, heuristic } from '../../utils/pathfinding/grid';
import { reconstructPath } from '../../utils/pathfinding/pathReconstruction';
import { AlgorithmRunnerProps, AlgorithmResult } from './index';
export const astar = async ({
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
   
    const openSet = [{ ...start, g: 0, f: heuristic(start, end) }];
    const cameFrom = new Map<string, Cell>();
    const gScore = new Map<string, number>();
    gScore.set(`${start.x},${start.y}`, 0);
    let visitedCount = 0;
    while (openSet.length > 0 && isRunningRef.current) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
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
                    // isRunning is not included here since we set it earlier
                }));
            }
           
            return {
                success: true,
                path,
                visitedCount
            };
        }
        // Process all neighbors
        for (const neighbor of getNeighbors(current, grid)) {
            // Check if algorithm should stop before potentially expensive operations
            if (!isRunningRef.current) {
                return null;
            }
           
            const tentativeGScore = gScore.get(`${current.x},${current.y}`)! + 1;
           
            if (!gScore.has(`${neighbor.x},${neighbor.y}`) ||
                tentativeGScore < gScore.get(`${neighbor.x},${neighbor.y}`)!) {
               
                cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
                gScore.set(`${neighbor.x},${neighbor.y}`, tentativeGScore);
                const fScore = tentativeGScore + heuristic(neighbor, end);
               
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push({ ...neighbor, g: tentativeGScore, f: fScore });
                   
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