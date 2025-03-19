// Types for the sorting algorithm visualizer

// Element status for visualization
export type ElementStatus = 
    | 'default' 
    | 'comparing' 
    | 'swap' 
    | 'potential-swap' 
    | 'sorted';

// Array element with value and status
export interface ArrayElement {
    value: number;
    status: ElementStatus;
}

// Supported sorting algorithms
export type AlgorithmType = 
    | 'selectionSort' 
    | 'bubbleSort' 
    | 'shakerSort';

// Props for sorting algorithm functions
export interface SortingProps {
    // Core data
    array: ArrayElement[];
    
    // UI manipulation functions
    updateArrayItem: (index: number, newStatus: ElementStatus, newValue?: number | null) => void;
    swap: (i: number, j: number) => void;
    
    // Control flow
    handleStopAndPause: () => Promise<boolean>;
    isSorted: (elements: ArrayElement[]) => Promise<boolean>;
    
    // Stats management
    setComparisons: React.Dispatch<React.SetStateAction<number>>;
    setArrayAccesses: React.Dispatch<React.SetStateAction<number>>;
    comparisonsRef: React.MutableRefObject<number>;
    arrayAccessesRef: React.MutableRefObject<number>;
    
    // Sorting state
    setSorting: React.Dispatch<React.SetStateAction<boolean>>;
    sortingRef: React.MutableRefObject<boolean>;
}