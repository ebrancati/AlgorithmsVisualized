import { SortingProps } from '../../types/sorting';

// Selection Sort Algorithm
export const runSelectionSort = async ({
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
        let minIdx = i;

        // Mark the current position
        updateArrayItem(i, 'potential-swap');

        for (let j = i + 1; j < n; j++) {
            // Mark the element being compared
            updateArrayItem(j, 'comparing');

            // Update comparisons and array accesses
            const newComparisons = comparisonsRef.current + 1;
            setComparisons(newComparisons);
            comparisonsRef.current = newComparisons;

            const newAccesses = arrayAccessesRef.current + 2;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Use tempArray for comparison to maintain consistent ordering
            if (tempArray[j].value < tempArray[minIdx].value) {
                if (minIdx !== i) {
                    updateArrayItem(minIdx, 'default');
                }
                minIdx = j;
                updateArrayItem(minIdx, 'swap');
            } else {
                updateArrayItem(j, 'default');
            }

            if (await handleStopAndPause()) return;
        }

        // Swap the found minimum element with the first element
        if (minIdx !== i) {
            updateArrayItem(i, 'swap');
            if (await handleStopAndPause()) return;

            // Update tempArray after swap
            const temp = tempArray[i].value;
            tempArray[i].value = tempArray[minIdx].value;
            tempArray[minIdx].value = temp;
            
            swap(minIdx, i);

            updateArrayItem(minIdx, 'default');
        }

        // Mark the element as sorted
        updateArrayItem(i, 'sorted');

        if (await handleStopAndPause()) return;
    }

    // Mark the last element as sorted
    updateArrayItem(n - 1, 'sorted');

    await isSorted(array);

    setSorting(false);
    sortingRef.current = false;
};