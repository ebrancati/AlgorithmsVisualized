import React from 'react';

const Legend: React.FC = () => {
    const legendItems = [
        { color: 'bg-green-500', label: 'Start node' },
        { color: 'bg-red-500', label: 'End node' },
        { color: 'bg-gray-800', label: 'Wall' },
        { color: 'bg-blue-300', label: 'Visited' },
        { color: 'bg-yellow-300', label: 'Path' }
    ];

    return (
        <div className="bg-gray-100 p-3 rounded-lg shadow-sm mb-4 w-full">
            <div className="text-sm font-semibold mb-2">Legend:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`w-4 h-4 ${item.color} rounded mr-2`}></div>
                        <span className="text-xs">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Legend;