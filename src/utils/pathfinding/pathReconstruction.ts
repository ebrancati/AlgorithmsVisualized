import { Cell, GridType } from '../../types/pathfinding';
import playSound from '../../utils/playSound';

/**
 * Reconstructs a path from a start node to an end node using a came-from map
 */
export const reconstructPath = async (
    current: Cell, 
    cameFrom: Map<string, Cell>,
    grid: GridType,
    setGrid: (grid: GridType | ((prevGrid: GridType) => GridType)) => void,
    isRunningRef: React.MutableRefObject<boolean>,
    animationSpeed: number = 30,
    end?: Cell
): Promise<Cell[]> => {
    const path: Cell[] = [];
    let currentNode: Cell | undefined = current;
    
    while (currentNode) {
        path.push(currentNode);
        currentNode = cameFrom.get(`${currentNode.x},${currentNode.y}`);
    }
    
    // Path visualization with animation
    for (let i = 0; i < path.length; i++) {
        // Stop animation if we're no longer running
        if (!isRunningRef.current) {
            break;
        }
        
        const node = path[i];
        if (i > 0) { // Skip animating the first node which is the end node
            await new Promise(resolve => setTimeout(resolve, animationSpeed / 2)); // Faster than node visitation
            
            // Create a higher frequency sound for the path
            if (end) {
                // Calculate progress-based sound frequency for path nodes
                const progress = (path.length - i) / path.length; // Closer to end = higher pitch
                const frequency = 220 + progress * 660; // Between 220Hz (A3) and 880Hz (A5)
                playSound(frequency, 50, false);
            } else {
                // Default sound if end not provided
                playSound(440, 50, false);
            }
            
            // If we're no longer running, stop
            if (!isRunningRef.current) {
                break;
            }
            
            setGrid(prevGrid => 
                prevGrid.map(row =>
                    row.map(cell =>
                        cell.x === node.x && cell.y === node.y && 
                        cell.type !== "start" && cell.type !== "end"
                            ? { ...cell, type: "path" }
                            : cell
                    )
                )
            );
        }
    }
    
    return path;
};

/**
 * Reconstructs a path in a bidirectional search where paths from both
 * start and end meet at a meeting node
 */
export const reconstructBidirectionalPath = async (
    meetingNode: Cell,
    startCameFrom: Map<string, Cell>,
    endCameFrom: Map<string, Cell>,
    grid: GridType,
    setGrid: (grid: GridType | ((prevGrid: GridType) => GridType)) => void,
    isRunningRef: React.MutableRefObject<boolean>,
    animationSpeed: number = 30
): Promise<Cell[]> => {
    // Reconstruct path from start to meeting node
    const startPath: Cell[] = [];
    let current: Cell | undefined = meetingNode;
    
    while (current) {
        startPath.push(current);
        current = startCameFrom.get(`${current.x},${current.y}`);
    }
    startPath.reverse();
    
    // Reconstruct path from meeting node to end
    const endPath: Cell[] = [];
    current = meetingNode;
    while (current) {
        if (current !== meetingNode) { // Avoid duplicating the meeting node
            endPath.push(current);
        }
        current = endCameFrom.get(`${current.x},${current.y}`);
    }
    
    // Combine paths (exclude duplicate meeting node)
    const fullPath = [...startPath, ...endPath];
    
    // Path visualization with animation
    for (let i = 0; i < fullPath.length; i++) {
        // Stop animation if we're no longer running
        if (!isRunningRef.current) {
            break;
        }
        
        const node = fullPath[i];
        if (node.type !== "start" && node.type !== "end") {
            await new Promise(resolve => setTimeout(resolve, animationSpeed / 2)); // Faster than node visitation
            
            // Create a higher frequency sound for the path
            // Calculate progress-based sound frequency for path nodes
            const progress = i / fullPath.length; // Progress through path
            const frequency = 220 + progress * 660; // Between 220Hz (A3) and 880Hz (A5)
            playSound(frequency, 50, false);
            
            // If we're no longer running, stop
            if (!isRunningRef.current) {
                break;
            }
            
            setGrid(prevGrid => 
                prevGrid.map(row =>
                    row.map(cell =>
                        cell.x === node.x && cell.y === node.y && 
                        cell.type !== "start" && cell.type !== "end"
                            ? { ...cell, type: "path" }
                            : cell
                    )
                )
            );
        }
    }
    
    return fullPath;
};