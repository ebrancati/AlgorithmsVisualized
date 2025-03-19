import { SortingProps } from '../../types/sorting';

// Shaker Sort Algorithm (Cocktail Sort)
export const runShakerSort = async ({
    array,
    updateArrayItem,
    swap,
    handleStopAndPause,
    setComparisons,
    setArrayAccesses,
    comparisonsRef,
    arrayAccessesRef,
    setSorting,
    sortingRef
}: SortingProps): Promise<void> => {
    // Create a local copy for comparison to fix ordering issues
    const tempArray = [...array];
    let start = 0;
    let end = array.length - 1;
    let swapped = true;

    while (swapped) {
        swapped = false;

        // Forward pass (similar to bubble sort)
        for (let i = start; i < end; i++) {
            updateArrayItem(i, 'potential-swap');
            updateArrayItem(i + 1, 'comparing');

            // Update comparisons and array accesses
            const newComparisons = comparisonsRef.current + 1;
            setComparisons(newComparisons);
            comparisonsRef.current = newComparisons;

            const newAccesses = arrayAccessesRef.current + 2;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Use tempArray for comparison to maintain consistent ordering
            if (tempArray[i].value > tempArray[i + 1].value) {
                updateArrayItem(i + 1, 'swap');

                if (await handleStopAndPause()) return;

                // Update tempArray after swap
                const temp = tempArray[i].value;
                tempArray[i].value = tempArray[i + 1].value;
                tempArray[i + 1].value = temp;
                
                swap(i, i + 1);
                swapped = true;

                updateArrayItem(i, 'swap');
                updateArrayItem(i + 1, 'potential-swap');

                if (await handleStopAndPause()) return;
            }

            updateArrayItem(i, 'default');
            updateArrayItem(i + 1, 'default');
        }

        // Mark the last element as sorted after forward pass
        updateArrayItem(end, 'sorted');
        
        if (!swapped) {
            for (let i = start; i < end; i++) {
                updateArrayItem(i, 'sorted');
            }
            break;
        }

        swapped = false;
        end--;

        // Backward pass
        for (let i = end - 1; i >= start; i--) {
            updateArrayItem(i, 'potential-swap');
            updateArrayItem(i + 1, 'comparing');

            // Update comparisons and array accesses
            const newComparisons = comparisonsRef.current + 1;
            setComparisons(newComparisons);
            comparisonsRef.current = newComparisons;

            const newAccesses = arrayAccessesRef.current + 2;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Use tempArray for comparison to maintain consistent ordering
            if (tempArray[i].value > tempArray[i + 1].value) {
                updateArrayItem(i + 1, 'swap');

                if (await handleStopAndPause()) return;

                // Update tempArray after swap
                const temp = tempArray[i].value;
                tempArray[i].value = tempArray[i + 1].value;
                tempArray[i + 1].value = temp;
                
                swap(i, i + 1);
                swapped = true;

                updateArrayItem(i, 'swap');
                updateArrayItem(i + 1, 'potential-swap');

                if (await handleStopAndPause()) return;
            }

            updateArrayItem(i, 'default');
            updateArrayItem(i + 1, 'default');
        }

        // Mark the first element as sorted after backward pass
        updateArrayItem(start, 'sorted');

        if (!swapped) {
            for (let i = start + 1; i <= end; i++) {
                updateArrayItem(i, 'sorted');
            }
            break;
        }

        start++;
    }

    setSorting(false);
    sortingRef.current = false;
};