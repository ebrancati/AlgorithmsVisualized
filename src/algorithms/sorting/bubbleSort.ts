import { SortingProps } from '../../types/sorting';

// Bubble Sort Algorithm
export const runBubbleSort = async ({
    array,
    updateArrayItem,
    swap,
    handleStopAndPause,
    isSorted,
    setComparisons,
    setArrayAccesses,
    comparisonsRef,
    arrayAccessesRef,
    setSorting,
    sortingRef
}: SortingProps): Promise<void> => {
    // Create a local copy for comparison to fix ordering issues
    const tempArray = [...array];
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            // Mark elements being compared
            updateArrayItem(j, 'potential-swap');
            updateArrayItem(j + 1, 'comparing');

            // Update comparisons and array accesses
            const newComparisons = comparisonsRef.current + 1;
            setComparisons(newComparisons);
            comparisonsRef.current = newComparisons;

            const newAccesses = arrayAccessesRef.current + 2;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Use tempArray for comparison to maintain consistent ordering
            if (tempArray[j].value > tempArray[j + 1].value) {
                updateArrayItem(j + 1, 'swap');

                if (await handleStopAndPause()) return;

                // Update tempArray after swap
                const temp = tempArray[j].value;
                tempArray[j].value = tempArray[j + 1].value;
                tempArray[j + 1].value = temp;
                
                swap(j, j + 1);
                swapped = true;

                updateArrayItem(j, 'swap');
                updateArrayItem(j + 1, 'potential-swap');

                if (await handleStopAndPause()) return;

                updateArrayItem(j, 'default');
                updateArrayItem(j + 1, 'default');
            } else {
                updateArrayItem(j, 'default');
                updateArrayItem(j + 1, 'default');
            }
        }
        
        // If no swaps occurred in this pass, the array is sorted
        if (!swapped) {
            // Mark all remaining elements as sorted
            for (let k = 0; k <= n - i - 1; k++) {
                updateArrayItem(k, 'sorted');
            }
            break;
        }

        // Mark the element as sorted
        updateArrayItem(n - i - 1, 'sorted');

        if (await handleStopAndPause()) return;
    }

    // Mark the first element as sorted
    updateArrayItem(0, 'sorted');

    await isSorted(array);

    setSorting(false);
    sortingRef.current = false;
};