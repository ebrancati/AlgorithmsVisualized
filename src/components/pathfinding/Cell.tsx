import React from 'react';
import { Cell as CellType } from '../../types/pathfinding';

interface CellProps {
    cell: CellType;
    onClick: () => void;
    onMouseOver: () => void;
    isDragging: boolean;
    isDraggingThis: boolean;
}

const Cell: React.FC<CellProps> = ({ 
    cell, 
    onClick, 
    onMouseOver, 
    isDraggingThis
}) => {
    return (
        <div
            className={`cell ${cell.type} ${isDraggingThis ? 'blink' : ''}`}
            onClick={onClick}
            onMouseOver={onMouseOver}
            data-testid={`cell-${cell.x}-${cell.y}`}
        />
    );
};

export default React.memo(Cell);