import React, { useState, useEffect }  from 'react';
import { AlgorithmType } from '../../types/pathfinding';
import { ALGORITHM_INFO } from '../../constants/pathfinding/index';

interface ControlsProps {
    onStartAlgorithm: () => void;
    onReset: () => void;
    onClearAll: () => void;
    isRunning: boolean;
    hasStartAndEnd: boolean;
    currentAlgorithm: AlgorithmType;
    hasVisitedOrPath: boolean;
}

/**
 * Button component with tooltip to show status information
 */
const ControlButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    activeStyle?: boolean;
    tooltip: string;
    disabledTooltip: string;
    children: React.ReactNode;
}> = ({ onClick, disabled, activeStyle, tooltip, disabledTooltip, children }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    // Determine button classes based on state
    const baseClasses = "font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out text-center w-full sm:min-w-[150px] sm:w-auto relative";
    const activeClasses = activeStyle 
        ? "bg-yellow-500 text-white ring-2 ring-yellow-300 shadow-lg"
        : "bg-green-500 hover:bg-green-600 text-white";
    const disabledClasses = "bg-gray-400 opacity-50 cursor-not-allowed";
    
    return (
        <div className="relative">
            <button
                onClick={onClick}
                className={`${baseClasses} ${disabled ? disabledClasses : activeClasses}`}
                disabled={disabled}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                aria-label={disabled ? disabledTooltip : tooltip}
            >
                {children}
            </button>
            
            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-90 z-10">
                    {disabled ? disabledTooltip : tooltip}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            )}
        </div>
    );
};

const Controls: React.FC<ControlsProps> = ({
    onStartAlgorithm,
    onReset,
    onClearAll,
    isRunning,
    hasStartAndEnd,
    currentAlgorithm,
    hasVisitedOrPath
}) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    
    // Handle edit grid button click
    const handleEditGrid = () => {
        if (isRunning) return;
        
        setEditMode(true);
        onReset();
    };
    
    // Handle start algorithm click
    const handleStart = () => {
        // Exit edit mode when starting algorithm
        if (editMode) {
            setEditMode(false);
        }
        
        onStartAlgorithm();
    };
    
    // Exit edit mode when algorithm starts running
    useEffect(() => {
        if (isRunning) {
            setEditMode(false);
        }
    }, [isRunning]);

    return (
        <div className="flex flex-col mt-4 gap-2 sm:flex-row justify-center">
            <ControlButton
                onClick={handleStart}
                disabled={isRunning || !hasStartAndEnd}
                tooltip={`Start ${ALGORITHM_INFO[currentAlgorithm].name} algorithm`}
                disabledTooltip={!hasStartAndEnd ? 'Set start and end points first' : 'Algorithm is running'}
            >
                {isRunning ? 'Running...' : `Start ${ALGORITHM_INFO[currentAlgorithm].name}`}
            </ControlButton>
            
            <ControlButton
                onClick={handleEditGrid}
                disabled={isRunning || !hasVisitedOrPath}
                activeStyle={editMode}
                tooltip="Reset visited and path cells"
                disabledTooltip={isRunning 
                    ? "Wait until algorithm finishes" 
                    : "No cells to reset - run an algorithm first"}
            >
                {editMode ? 'Editing...' : 'Edit Grid'}
            </ControlButton>
            
            <ControlButton
                onClick={onClearAll}
                disabled={isRunning}
                tooltip="Clear the entire grid"
                disabledTooltip="Wait until algorithm finishes"
            >
                Clear All
            </ControlButton>
        </div>
    );
};

export default Controls;