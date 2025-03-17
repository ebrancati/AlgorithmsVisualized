import React from 'react';
import { AlgorithmType } from '../../types/pathfinding';

interface AlgorithmSelectorProps {
    currentAlgorithm: AlgorithmType;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled: boolean;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
    currentAlgorithm,
    onChange,
    disabled
}) => {
    return (
        <div className={`flex items-center ${disabled ? 'cursor-not-allowed' : ''}`}>
            <label 
                className={`mr-2 text-sm ${disabled ? 'cursor-not-allowed' : ''}`} 
                htmlFor="algorithm"
            >
                Pathfinding Algorithm:
            </label>
            <select
                id="algorithm"
                className={`
                    border rounded px-2 py-1 text-sm
                    ${disabled ? 'cursor-not-allowed opacity-70 bg-gray-100' : 'cursor-pointer'}
                    focus:outline-none
                `}
                value={currentAlgorithm}
                onChange={onChange}
                disabled={disabled}
            >
                <option value="dijkstra">Dijkstra</option>
                <option value="astar">A*</option>
                <option value="bidirectional">Bidirectional</option>
                <option value="depth-first-search">Depth-first search</option>
            </select>
        </div>
    );
};

export default AlgorithmSelector;