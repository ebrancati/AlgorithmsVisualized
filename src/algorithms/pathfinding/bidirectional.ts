import { Cell } from '../../types/pathfinding';
import { getNeighbors } from '../../utils/pathfinding/grid';
import { reconstructBidirectionalPath } from '../../utils/pathfinding/pathReconstruction';
import { AlgorithmRunnerProps, AlgorithmResult } from './index';

export const bidirectional = async ({
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
    
    const startQueue = [{ ...start, distance: 0 }];
    const endQueue = [{ ...end, distance: 0 }];
    const startCameFrom = new Map<string, Cell>();
    const endCameFrom = new Map<string, Cell>();
    const startVisited = new Set<string>();
    const endVisited = new Set<string>();
    
    startVisited.add(`${start.x},${start.y}`);
    endVisited.add(`${end.x},${end.y}`);
    let visitedCount = 0;

    while (startQueue.length > 0 && endQueue.length > 0 && isRunningRef.current) {
        // Process from start direction
        if (startQueue.length > 0) {
            const currentStart = startQueue.shift()!;
            
            for (const neighbor of getNeighbors(currentStart, grid)) {
                // Check if algorithm should stop before potentially expensive operations
                if (!isRunningRef.current) {
                    return null;
                }
                
                if (!startVisited.has(`${neighbor.x},${neighbor.y}`)) {
                    startVisited.add(`${neighbor.x},${neighbor.y}`);
                    startCameFrom.set(`${neighbor.x},${neighbor.y}`, currentStart);
                    startQueue.push({ ...neighbor, distance: currentStart.distance + 1 });
                    
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
                    
                    // Check if we've found a meeting point
                    if (endVisited.has(`${neighbor.x},${neighbor.y}`)) {
                        // First, stop the timer immediately when meeting point is found
                        if (isRunningRef.current) {
                            setStats(prevStats => ({
                                ...prevStats,
                                isRunning: false // Stop the timer here
                            }));
                        }
                        
                        // Then reconstruct and visualize the path
                        const path = await reconstructBidirectionalPath(
                            neighbor, 
                            startCameFrom, 
                            endCameFrom,
                            grid,
                            setGrid,
                            isRunningRef,
                            animationSpeed
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
                }
            }
        }

        // Process from end direction
        if (endQueue.length > 0 && isRunningRef.current) {
            const currentEnd = endQueue.shift()!;
            
            for (const neighbor of getNeighbors(currentEnd, grid)) {
                // Check if algorithm should stop before potentially expensive operations
                if (!isRunningRef.current) {
                    return null;
                }
                
                if (!endVisited.has(`${neighbor.x},${neighbor.y}`)) {
                    endVisited.add(`${neighbor.x},${neighbor.y}`);
                    endCameFrom.set(`${neighbor.x},${neighbor.y}`, currentEnd);
                    endQueue.push({ ...neighbor, distance: currentEnd.distance + 1 });
                    
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
                    
                    // Check if we've found a meeting point
                    if (startVisited.has(`${neighbor.x},${neighbor.y}`)) {
                        // First, stop the timer immediately when meeting point is found
                        if (isRunningRef.current) {
                            setStats(prevStats => ({
                                ...prevStats,
                                isRunning: false // Stop the timer here
                            }));
                        }
                        
                        // Then reconstruct and visualize the path
                        const path = await reconstructBidirectionalPath(
                            neighbor, 
                            startCameFrom, 
                            endCameFrom,
                            grid,
                            setGrid,
                            isRunningRef,
                            animationSpeed
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