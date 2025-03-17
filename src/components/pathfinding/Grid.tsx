import React, { useRef } from 'react';
import Cell from './Cell';
import { GridType } from '../../types/pathfinding';

interface GridProps {
    grid: GridType;
    draggingNodeType: "start" | "end" | null;
    isMouseDown: boolean;
    onCellClick: (x: number, y: number) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseOver: (x: number, y: number) => void;
}

const Grid: React.FC<GridProps> = ({
    grid,
    draggingNodeType,
    isMouseDown,
    onCellClick,
    onMouseDown,
    onMouseUp,
    onMouseOver
}) => {
    const gridRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={gridRef}
            className="grid-container"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            data-testid="pathfinding-grid"
        >
            {grid.map(row =>
                row.map(cell => (
                    <Cell
                        key={`${cell.x}-${cell.y}`}
                        cell={cell}
                        onClick={() => onCellClick(cell.x, cell.y)}
                        onMouseOver={() => onMouseOver(cell.x, cell.y)}
                        isDragging={isMouseDown && draggingNodeType !== null}
                        isDraggingThis={
                            !isMouseDown &&
                            ((draggingNodeType === "start" && cell.type === "start") ||
                                (draggingNodeType === "end" && cell.type === "end"))
                        }
                    />
                ))
            )}
        </div>
    );
};

export default Grid;