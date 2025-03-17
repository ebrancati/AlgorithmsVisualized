import React from 'react';
import { Stats } from '../../types/pathfinding';
import { formatTime } from '../../utils/pathfinding/grid';

interface StatsDisplayProps {
    stats: Stats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    return (
        <div className="stats-container bg-gray-100 p-4 rounded-lg shadow-sm mb-4 w-full">
            <div className="text-sm font-semibold mb-2">Navigation Data:</div>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="stat-box">
                    <div className="text-sm font-semibold text-gray-600">Cells Visited</div>
                    <div className="text-xl font-bold text-green-600">{stats.visitedCells}</div>
                </div>
                <div className="stat-box">
                    <div className="text-sm font-semibold text-gray-600">Path Length</div>
                    <div className="text-xl font-bold text-green-600">{stats.pathDistance}</div>
                </div>
                <div className="stat-box">
                    <div className="text-sm font-semibold text-gray-600">Time</div>
                    <div className="text-xl font-bold text-green-600">{formatTime(stats.elapsedTime)}</div>
                </div>
            </div>
        </div>
    );
};

export default StatsDisplay;