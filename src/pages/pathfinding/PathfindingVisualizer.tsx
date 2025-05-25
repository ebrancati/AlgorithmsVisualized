import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlgorithmType, GridType } from '../../types/pathfinding';
import { usePathfindingGrid } from '../../hooks/usePathfindingGrid';
import { dijkstra, astar, dfs, bidirectional } from '../../algorithms/pathfinding';
import { resetPathAndVisited } from '../../utils/pathfinding/grid';
import { ALGORITHM_INFO as algorithmInfo } from '../../constants/pathfinding/index';

// Import components
import Grid from '../../components/pathfinding/Grid';
import Legend from '../../components/pathfinding/Legend';
import StatsDisplay from '../../components/pathfinding/StatsDisplay';
import AlgorithmSelector from '../../components/pathfinding/AlgorithmSelector';
import Controls from '../../components/pathfinding/Controls';
import AlgorithmDescription from '../../components/pathfinding/AlgorithmDescription';

// Import styles
import '../../style/pathfinding-grid.css';

// Constants
const GRID_ROWS = 10;
const GRID_COLS = 20;
const ANIMATION_SPEED = 30;

// Utility function to check if grid has visited or path cells
const hasVisitedOrPathCells = (grid: GridType) => {
    for (const row of grid) {
        for (const cell of row) {
            if (cell.type === 'visited' || cell.type === 'path') {
                return true;
            }
        }
    }
    return false;
};

const PathfindingVisualizer: React.FC = () => {
    // URL and navigation hooks
    const navigate = useNavigate();
    const location = useLocation();
    
    // State for the current algorithm
    const [currentAlgorithm, setCurrentAlgorithm] = useState<AlgorithmType>("dijkstra");
    const previousAlgorithm = useRef<AlgorithmType>(currentAlgorithm);
    
    // Reference to keep track of component mount state
    const isMounted = useRef<boolean>(true);
    
    // State for error message
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Grid hook for managing the grid state and interactions
    const {
        grid,
        setGrid,
        start,
        end,
        stats,
        setStats,
        isMouseDown,
        draggingNodeType,
        isRunningRef,
        handleCellClick,
        handleMouseDown,
        handleMouseUp,
        handleMouseOver,
        handleClearAll,
        handleReset,
        visitNode
    } = usePathfindingGrid({
        rows: GRID_ROWS,
        cols: GRID_COLS,
        animationSpeed: ANIMATION_SPEED
    });

    // Set component as unmounted on cleanup
    useEffect(() => {
        return () => {
            isMounted.current = false;
            
            // Stop any running algorithm when component unmounts
            if (isRunningRef.current) {
                isRunningRef.current = false;
            }
        };
    }, [isRunningRef]);

    // Set initial algorithm based on URL and handle algorithm changes
    useEffect(() => {
        const pathSegments = location.pathname.split("/").filter(Boolean);
        const lastSegment = pathSegments.pop() || "";
        
        if (lastSegment in algorithmInfo) {
            const newAlgorithm = lastSegment as AlgorithmType;
            
            // Stop algorithm if it's running and algorithm changed
            if (isRunningRef.current && previousAlgorithm.current !== newAlgorithm) {
                console.log('Algorithm changed, stopping execution');
                isRunningRef.current = false;
                if (isMounted.current) {
                    setStats(prevStats => ({ ...prevStats, isRunning: false }));
                }
            }
            
            setCurrentAlgorithm(newAlgorithm);
        } else {
            navigate("/pathfinding/dijkstra", { replace: true });
        }
    }, [location, navigate, isRunningRef, setStats]);

    // Effect to auto-dismiss error message after 5 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Handle page changes and cleanup
    useEffect(() => {
        // Function to handle location changes
        const handleLocationChange = () => {
            const pathfindingRegex = /\/pathfinding\/.+/;
            
            if (!location.pathname.match(pathfindingRegex) && isRunningRef.current) {
                console.log('Navigating away, stopping algorithm');
                isRunningRef.current = false;
                if (isMounted.current) {
                    setStats(prevStats => ({ ...prevStats, isRunning: false }));
                }
            }
        };
        
        // Call it once to check initial route
        handleLocationChange();
        
        // Add listeners for all navigation events
        window.addEventListener('popstate', handleLocationChange);
        window.addEventListener('beforeunload', handleLocationChange);
        
        // Clean up function
        return () => {
            window.removeEventListener('popstate', handleLocationChange);
            window.removeEventListener('beforeunload', handleLocationChange);
            
            // Final check on cleanup
            handleLocationChange();
        };
    }, [location.pathname, isRunningRef, setStats]);
    
    // Handle algorithm change from dropdown
    const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAlgorithm = e.target.value as AlgorithmType;
        
        // Stop any running algorithm
        if (isRunningRef.current) {
            console.log('Algorithm changed via dropdown, stopping execution');
            isRunningRef.current = false;
            setStats(prevStats => ({ ...prevStats, isRunning: false }));
        }
        
        setCurrentAlgorithm(newAlgorithm);
        // previousAlgorithm.current = newAlgorithm; ← RIMUOVI questa riga
        navigate(`/pathfinding/${newAlgorithm}`, { replace: true });

        // Reset visited and path cells when changing algorithm
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

        // Reset stats to initial state
        setStats({
            visitedCells: 0,
            pathDistance: 0,
            elapsedTime: 0,
            isRunning: false
        });
    };
    
    // Main algorithm runner
    const handleStartAlgorithm = async () => {
        previousAlgorithm.current = currentAlgorithm;

        if (!start || !end) return;
        
        // Reset any error messages
        setErrorMessage(null);
        
        // Reset any previous results
        setGrid(resetPathAndVisited(grid));
        isRunningRef.current = true;
        setStats(prevStats => ({ 
            ...prevStats, 
            isRunning: true, 
            visitedCells: 0, 
            pathDistance: 0, 
            elapsedTime: 0 
        }));
        
        // Run the selected algorithm
        try {
            let result;
            switch(currentAlgorithm) {
                case "dijkstra":
                    result = await dijkstra({
                        grid,
                        start,
                        end,
                        visitNode,
                        isRunningRef,
                        setStats,
                        setGrid,
                        animationSpeed: ANIMATION_SPEED
                    });
                    break;
                case "astar":
                    result = await astar({
                        grid,
                        start,
                        end,
                        visitNode,
                        isRunningRef,
                        setStats,
                        setGrid,
                        animationSpeed: ANIMATION_SPEED
                    });
                    break;
                case "depth-first-search":
                    result = await dfs({
                        grid,
                        start,
                        end,
                        visitNode,
                        isRunningRef,
                        setStats,
                        setGrid,
                        animationSpeed: ANIMATION_SPEED
                    });
                    break;
                case "bidirectional":
                    result = await bidirectional({
                        grid,
                        start,
                        end,
                        visitNode,
                        isRunningRef,
                        setStats,
                        setGrid,
                        animationSpeed: ANIMATION_SPEED
                    });
                    break;
                default:
                    console.error(`Algorithm not implemented: ${currentAlgorithm}`);
            }
            
            // Check if a path was found or not
            if (result && !result.success && isRunningRef.current) {
                setErrorMessage("No path found! The destination is blocked by walls.");
            }
        } finally {
            // Ensure we mark the algorithm as not running when done
            if (isRunningRef.current && isMounted.current) {
                isRunningRef.current = false;
                setStats(prevStats => ({ ...prevStats, isRunning: false }));
            }
        }
    };
    
    return (
        <div className="p-4">
            <AlgorithmSelector 
                currentAlgorithm={currentAlgorithm}
                onChange={handleAlgorithmChange}
                disabled={stats.isRunning}
            />
            
            <div className="flex justify-center items-center pt-10">
                <div className="flex flex-col items-center">
                    <Legend />

                    <div className="instruction mb-4 max-w-2xl">
                        <p>Start and end nodes are draggable. To change their position, first click on 'Edit Grid,' then select the node you want to move. Now keep pressing and drag it around the grid.</p>
                    </div>

                    <StatsDisplay stats={stats} />

                    <div className="instruction mb-4">
                        <p>Select the start and end nodes of the grid, add some walls, then run {algorithmInfo[currentAlgorithm].name}</p>
                    </div>

                    {/* Error message display */}
                    {errorMessage && (
                        <div className="bg-red-500 text-white p-2 rounded mb-4 w-full flex items-center justify-between">
                            <span className="flex items-center">
                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {errorMessage}
                            </span>
                            <button 
                                onClick={() => setErrorMessage(null)}
                                className="text-white hover:text-gray-200"
                                aria-label="Dismiss"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    
                    <Grid 
                        grid={grid}
                        draggingNodeType={draggingNodeType}
                        isMouseDown={isMouseDown}
                        onCellClick={handleCellClick}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseOver={handleMouseOver}
                    />
                    
                    <Controls 
                        onStartAlgorithm={handleStartAlgorithm}
                        onReset={handleReset}
                        onClearAll={handleClearAll}
                        isRunning={stats.isRunning}
                        hasStartAndEnd={Boolean(start && end)}
                        currentAlgorithm={currentAlgorithm}
                        hasVisitedOrPath={hasVisitedOrPathCells(grid) && previousAlgorithm.current === currentAlgorithm}
                    />
                </div>
            </div>
            
            <AlgorithmDescription algorithm={currentAlgorithm} />
        </div>
    );
};

export default PathfindingVisualizer;