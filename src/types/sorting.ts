// Types for the sorting algorithm visualizer

// Possible state of an element in the array
export type ElementStatus = 'default' | 'comparing' | 'swap' | 'potential-swap' | 'sorted';

// Array element with value and status
export interface ArrayElement {
    value: number;
    status: ElementStatus;
}

// Supported sorting algorithms
export type SortingAlgorithm = 'selectionSort' | 'bubbleSort' | 'shakerSort';

// Speed multipliers
export type SpeedMultiplier = '0.5x' | '1x' | '4x' | '100x';

// Sorting statistics
export interface SortingStats {
    comparisons: number;
    arrayAccesses: number;
    delay: number;
}

// Sorting state
export interface SortingState {
    sorting: boolean;
    paused: boolean;
    shuffling: boolean;
}

// Properties for sorting functions
export interface SortingFunctionProps {
    array: ArrayElement[];
    updateArrayItem: (index: number, newStatus: ElementStatus, newValue?: number | null) => void;
    swap: (i: number, j: number) => void;
    handleStopAndPause: () => Promise<boolean>;
    setStats: (updater: (prev: SortingStats) => SortingStats) => void;
    stats: {
        comparisons: number;
        arrayAccesses: number;
    };
    onSortingComplete: () => void;
}