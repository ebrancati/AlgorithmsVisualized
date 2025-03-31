import { SortingProps } from '../../types/sorting';

// Merge Sort Algorithm
export const runMergeSort = async ({
    array,
    updateArrayItem,
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

    // Main merge sort function
    const mergeSort = async (start: number, end: number): Promise<void> => {
        // Base case: If the subarray has 1 or fewer elements, it's already sorted
        if (start >= end) {
            return;
        }

        // Find the middle point to divide the array
        const mid = Math.floor((start + end) / 2);

        // Highlight the current subarray being processed
        for (let i = start; i <= end; i++) {
            updateArrayItem(i, 'potential-swap');

            // Increment array accesses
            const newAccesses = arrayAccessesRef.current + 1;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;
        }

        if (await handleStopAndPause()) return;

        // Recursively sort the first half
        await mergeSort(start, mid);
        if (!sortingRef.current) return;

        // Recursively sort the second half
        await mergeSort(mid + 1, end);
        if (!sortingRef.current) return;

        // Merge the sorted halves
        await merge(start, mid, end);
    };

    // Function to merge two subarrays
    const merge = async (start: number, mid: number, end: number): Promise<void> => {
        // Create temporary arrays for the two halves
        const leftSize = mid - start + 1;
        const rightSize = end - mid;

        const leftArray = new Array(leftSize);
        const rightArray = new Array(rightSize);

        // Copy data to temporary arrays
        for (let i = 0; i < leftSize; i++) {
            leftArray[i] = tempArray[start + i].value;

            // Increment array accesses
            const newAccesses = arrayAccessesRef.current + 1;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            // Highlight elements being copied
            updateArrayItem(start + i, 'comparing');

            if (await handleStopAndPause()) return;
        }

        for (let i = 0; i < rightSize; i++) {
            rightArray[i] = tempArray[mid + 1 + i].value;

            // Increment array accesses
            const newAccesses = arrayAccessesRef.current + 1;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            // Highlight elements being copied
            updateArrayItem(mid + 1 + i, 'comparing');

            if (await handleStopAndPause()) return;
        }

        // Initial indices of the subarrays
        let i = 0, j = 0;
        // Initial index of merged subarray
        let k = start;

        // Merge the temp arrays back into the main array
        while (i < leftSize && j < rightSize) {
            // Increment comparisons
            const newComparisons = comparisonsRef.current + 1;
            setComparisons(newComparisons);
            comparisonsRef.current = newComparisons;

            // Compare elements from both subarrays
            if (leftArray[i] <= rightArray[j]) {
                // Update the value in both the visual array and the temp array
                tempArray[k].value = leftArray[i];

                // Highlight the element being placed
                updateArrayItem(k, 'swap', leftArray[i]);

                i++;
            } else {
                // Update the value in both the visual array and the temp array
                tempArray[k].value = rightArray[j];

                // Highlight the element being placed
                updateArrayItem(k, 'swap', rightArray[j]);

                j++;
            }

            // Increment array accesses (1 write)
            const newAccesses = arrayAccessesRef.current + 1;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Reset the highlight
            updateArrayItem(k, 'default');

            k++;
        }

        // Copy the remaining elements of left subarray if any
        while (i < leftSize) {
            // Update the value in both the visual array and the temp array
            tempArray[k].value = leftArray[i];

            // Highlight the element being placed
            updateArrayItem(k, 'swap', leftArray[i]);

            // Increment array accesses (1 write)
            const newAccesses = arrayAccessesRef.current + 1;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Reset the highlight
            updateArrayItem(k, 'default');

            i++;
            k++;
        }

        // Copy the remaining elements of right subarray if any
        while (j < rightSize) {
            // Update the value in both the visual array and the temp array
            tempArray[k].value = rightArray[j];

            // Highlight the element being placed
            updateArrayItem(k, 'swap', rightArray[j]);

            // Increment array accesses (1 write)
            const newAccesses = arrayAccessesRef.current + 1;
            setArrayAccesses(newAccesses);
            arrayAccessesRef.current = newAccesses;

            if (await handleStopAndPause()) return;

            // Reset the highlight
            updateArrayItem(k, 'default');

            j++;
            k++;
        }

        // After merging, update the main array to reflect the changes
        for (let i = start; i <= end; i++) {
            array[i].value = tempArray[i].value;
        }

        // Check if we're at the end of the entire sort (final merge)
        if (start === 0 && end === n - 1) {
            for (let i = 0; i < n - 1; i++) {
                if (array[i].value > array[i + 1].value) {
                    console.error(`Errore di ordinamento: elementi ${i} (${array[i].value}) e ${i + 1} (${array[i + 1].value}) non sono in ordine`);
                }
            }
            // Verify the array is sorted and finish
            if (sortingRef.current) {
                await isSorted(array);
                setSorting(false);
                sortingRef.current = false;
            }
        }
    };

    // Start the merge sort
    await mergeSort(0, n - 1);
};