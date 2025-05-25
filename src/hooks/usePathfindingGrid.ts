import { useState, useRef, useEffect } from 'react';
import { Cell, GridType, Stats } from '../types/pathfinding';
import { createGrid } from '../utils/pathfinding/grid';
import { playAlgorithmSound as playSound} from '../utils/audioUtils';

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
    isRunningRef: React.RefObject<boolean>;
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
    const [isNodeSelectionMode, setIsNodeSelectionMode] = useState<boolean>(false);

    const isRunningRef = useRef<boolean>(false);
    const startTimeRef = useRef<number>(0);
    const timerRef = useRef<number | null>(null);

    // Timer for tracking elapsed time
    useEffect(() => {
        if (stats.isRunning) {
            // Reset dragging state when algorithm starts to prevent blinking nodes
            setDraggingNodeType(null);
            setIsNodeSelectionMode(false);

            // Calculate start time to preserve elapsed time across pause/resume
            startTimeRef.current = Date.now() - stats.elapsedTime;

            // Update elapsed time every 100ms for real-time display in stats
            timerRef.current = setInterval(() => {
                setStats(prevStats => ({
                    ...prevStats,
                    elapsedTime: Date.now() - startTimeRef.current
                }));
            }, 100);
        } else if (timerRef.current) {
            // Clean up timer when algorithm stops
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

        const clickedCell = grid[y][x];

        // Case 1: Cell is start node - begin selection
        if (clickedCell.type === "start") {
            setDraggingNodeType("start");
            setIsNodeSelectionMode(true);
            return;
        }

        // Case 2: Cell is end node - begin selection
        if (clickedCell.type === "end") {
            setDraggingNodeType("end");
            setIsNodeSelectionMode(true);
            return;
        }

        // Case 3: If we're in node selection mode, place the selected node
        if (isNodeSelectionMode && draggingNodeType) {
            setGrid(prevGrid => {
                // Only allow placing on valid cells
                if (clickedCell.type !== "start" && clickedCell.type !== "end" && clickedCell.type !== "wall") {
                    const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));

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
                return prevGrid;
            });

            // Exit selection mode
            setDraggingNodeType(null);
            setIsNodeSelectionMode(false);
            return;
        }

        // Case 4: No start node exists - place it
        if (!start) {
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
                newGrid[y][x].type = "start";
                setStart(newGrid[y][x]);
                return newGrid;
            });
            return;
        }

        // Case 5: No end node exists - place it
        if (!end) {
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
                newGrid[y][x].type = "end";
                setEnd(newGrid[y][x]);
                return newGrid;
            });
            return;
        }

        // Case 6: Toggle wall when not in selection mode
        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
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

        if (!isNodeSelectionMode) {
            setDraggingNodeType(null);
        }
    };

    const handleMouseOver = (x: number, y: number) => {
        if (isRunningRef.current || !isMouseDown) return;

        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
            const hoverCell = prevGrid[y][x];

            // If we're dragging a node (start or end)
            if (draggingNodeType) {
                // Only allow placing on valid cells
                if (hoverCell.type !== "empty" &&
                    hoverCell.type !== "visited" &&
                    hoverCell.type !== "path") {
                    return prevGrid;
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

            // Create walls only when not in selection mode
            if (!isNodeSelectionMode && start && end &&
                hoverCell.type !== "start" && hoverCell.type !== "end") {
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
        setDraggingNodeType(null);
        setIsNodeSelectionMode(false);
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
        setDraggingNodeType(null);
        setIsNodeSelectionMode(false);
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