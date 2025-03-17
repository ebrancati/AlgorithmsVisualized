import { useState, useRef, useEffect } from 'react';
import { Cell, GridType, Stats } from '../types/pathfinding';
import { createGrid } from '../utils/pathfinding/grid';
import playSound from '../utils/playSound';

interface UsePathfindingGridProps {
    rows: number;
    cols: number;
    animationSpeed: number;
}

interface UsePathfindingGridResult {
    grid: GridType;
    setGrid: React.Dispatch<React.SetStateAction<GridType>>;
    start: Cell | null;
    setStart: React.Dispatch<React.SetStateAction<Cell | null>>;
    end: Cell | null;
    setEnd: React.Dispatch<React.SetStateAction<Cell | null>>;
    stats: Stats;
    setStats: React.Dispatch<React.SetStateAction<Stats>>;
    isMouseDown: boolean;
    setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>;
    draggingNodeType: "start" | "end" | null;
    setDraggingNodeType: React.Dispatch<React.SetStateAction<"start" | "end" | null>>;
    isRunningRef: React.MutableRefObject<boolean>;
    handleCellClick: (x: number, y: number) => void;
    handleMouseDown: () => void;
    handleMouseUp: () => void;
    handleMouseOver: (x: number, y: number) => void;
    handleClearAll: () => void;
    handleReset: () => void;
    visitNode: (node: Cell) => Promise<void>;
}

export const usePathfindingGrid = ({
    rows,
    cols,
    animationSpeed
}: UsePathfindingGridProps): UsePathfindingGridResult => {
    const [grid, setGrid] = useState<GridType>(createGrid(rows, cols));
    const [start, setStart] = useState<Cell | null>(null);
    const [end, setEnd] = useState<Cell | null>(null);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [stats, setStats] = useState<Stats>({
        visitedCells: 0,
        pathDistance: 0,
        elapsedTime: 0,
        isRunning: false
    });
    const [draggingNodeType, setDraggingNodeType] = useState<"start" | "end" | null>(null);
    
    const isRunningRef = useRef<boolean>(false);
    const startTimeRef = useRef<number>(0);
    const timerRef = useRef<number | null>(null);

    // Timer for tracking elapsed time
    useEffect(() => {
        if (stats.isRunning) {
            startTimeRef.current = Date.now() - stats.elapsedTime;
            timerRef.current = setInterval(() => {
                setStats(prevStats => ({
                    ...prevStats,
                    elapsedTime: Date.now() - startTimeRef.current
                }));
            }, 100);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [stats.isRunning, stats.elapsedTime]);

    // Event Handlers
    const handleCellClick = (x: number, y: number) => {
        if (isRunningRef.current) return;
        
        setGrid(prevGrid => {
            // Get the clicked cell
            const clickedCell = prevGrid[y][x];
            
            // Case 1: Cell is start node - begin dragging it
            if (clickedCell.type === "start") {
                setDraggingNodeType("start");
                return prevGrid;
            }
            
            // Case 2: Cell is end node - begin dragging it
            if (clickedCell.type === "end") {
                setDraggingNodeType("end");
                return prevGrid;
            }
            
            // Case 3: No start node exists - place it
            if (!start) {
                const newGrid = prevGrid.map(row => 
                    row.map(cell => ({...cell}))
                );
                newGrid[y][x].type = "start";
                setStart(newGrid[y][x]);
                return newGrid;
            }
            
            // Case 4: No end node exists - place it
            if (!end) {
                const newGrid = prevGrid.map(row => 
                    row.map(cell => ({...cell}))
                );
                newGrid[y][x].type = "end";
                setEnd(newGrid[y][x]);
                return newGrid;
            }
            
            // Case 5: Toggle wall
            const newGrid = prevGrid.map(row => 
                row.map(cell => ({...cell}))
            );
            if (clickedCell.type === "wall") {
                newGrid[y][x].type = "empty";
            } else if (clickedCell.type === "empty") {
                newGrid[y][x].type = "wall";
            }
            return newGrid;
        });
    };

    const handleMouseDown = () => {
        setIsMouseDown(true);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
        setDraggingNodeType(null);
    };

    const handleMouseOver = (x: number, y: number) => {
        if (isRunningRef.current || !isMouseDown) return;
        
        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => row.map(cell => ({...cell})));
            
            // If we're dragging a node (start or end)
            if (draggingNodeType) {
                // First, check if the target cell is already occupied
                if (newGrid[y][x].type !== "empty" && 
                    newGrid[y][x].type !== "visited" && 
                    newGrid[y][x].type !== "path") {
                    return prevGrid; // Can't move to an occupied cell
                }
                
                // Remove the old node
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if (newGrid[i][j].type === draggingNodeType) {
                            newGrid[i][j].type = "empty";
                        }
                    }
                }
                
                // Place the node at the new position
                newGrid[y][x].type = draggingNodeType;
                
                // Update the state reference
                if (draggingNodeType === "start") {
                    setStart(newGrid[y][x]);
                } else if (draggingNodeType === "end") {
                    setEnd(newGrid[y][x]);
                }
                
                return newGrid;
            }
            
            // Otherwise, if we have both start and end nodes, we're drawing walls
            if (start && end && newGrid[y][x].type !== "start" && newGrid[y][x].type !== "end") {
                newGrid[y][x].type = "wall";
                return newGrid;
            }
            
            return prevGrid;
        });
    };

    const handleClearAll = () => {
        setGrid(createGrid(rows, cols));
        setStart(null);
        setEnd(null);
        isRunningRef.current = false;
        setStats({
            visitedCells: 0,
            pathDistance: 0,
            elapsedTime: 0,
            isRunning: false
        });
    };

    const handleReset = () => {
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(cell => {
                    if (cell.type === "visited" || cell.type === "path") {
                        return { ...cell, type: "empty" };
                    }
                    return cell;
                })
            )
        );
        isRunningRef.current = false;
        setStats({
            visitedCells: 0,
            pathDistance: 0,
            elapsedTime: 0,
            isRunning: false
        });
    };

    // Helper for algorithms to visualize visited nodes
    const visitNode = async (node: Cell) => {
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        if (!isRunningRef.current) return;
        
        // Calculate distance-based sound frequency
        const distance = end ? Math.sqrt(Math.pow(node.x - end.x, 2) + Math.pow(node.y - end.y, 2)) : 0;
        const maxDistance = Math.sqrt(Math.pow(cols, 2) + Math.pow(rows, 2));
        const frequency = (1 - distance / maxDistance) * 40;
        
        playSound(frequency, 75, false);
        
        setGrid(prevGrid =>
            prevGrid.map(row =>
                row.map(cell => {
                    if (cell.x === node.x && cell.y === node.y && 
                        cell.type !== "start" && cell.type !== "end") {
                        return { ...cell, type: "visited" };
                    }
                    return cell;
                })
            )
        );
    };

    return {
        grid,
        setGrid,
        start,
        setStart,
        end,
        setEnd,
        stats,
        setStats,
        isMouseDown,
        setIsMouseDown,
        draggingNodeType,
        setDraggingNodeType,
        isRunningRef,
        handleCellClick,
        handleMouseDown,
        handleMouseUp,
        handleMouseOver,
        handleClearAll,
        handleReset,
        visitNode
    };
};