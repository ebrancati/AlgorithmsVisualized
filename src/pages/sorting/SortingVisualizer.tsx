import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import playSound from '../../utils/playSound';
import { runSelectionSort, runBubbleSort, runShakerSort, runMergeSort } from '../../algorithms/sorting';
import { ArrayElement, AlgorithmType, ElementStatus } from '../../types/sorting';
import AlgorithmDescription from '../../components/sorting/AlgorithmDescription';

const SortingVisualizer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [array, setArray] = useState<ArrayElement[]>([]);
    const [numElements, setNumElements] = useState<number>(30);
    const [algorithm, setAlgorithm] = useState<AlgorithmType>('selectionSort');
    const [comparisons, setComparisons] = useState<number>(0);
    const [arrayAccesses, setArrayAccesses] = useState<number>(0);
    const [delay, setDelay] = useState<number>(100);
    const [sorting, setSorting] = useState<boolean>(false);
    const [paused, setPaused] = useState<boolean>(false);
    const [speed, setSpeed] = useState<string>('1x');
    const [shuffling, setShuffling] = useState<boolean>(false);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

    // Create refs to keep track of mutable values in async functions
    const sortingRef = useRef<boolean>(false);
    const pausedRef = useRef<boolean>(false);
    const delayRef = useRef<number>(100);
    const arrayRef = useRef<ArrayElement[]>([]);
    const comparisonsRef = useRef<number>(0);
    const arrayAccessesRef = useRef<number>(0);
    const shufflingRef = useRef<boolean>(false);
    const pendingOperationRef = useRef<string | null>(null);

    // Define isMuted as a constant or a state if you need to change it
    const isMuted = false;

    const sleep = useCallback((ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }, []);

    const resetSorting = useCallback((): void => {
        setSorting(false);
        sortingRef.current = false;
        setPaused(false);
        pausedRef.current = false;
        setComparisons(0);
        setArrayAccesses(0);
        comparisonsRef.current = 0;
        arrayAccessesRef.current = 0;
    }, []);

    // Define drawArray as useCallback to avoid dependency warnings
    const drawArray = useCallback((): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear the canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate bar width
        const barWidth = width / array.length;

        // Draw each bar
        array.forEach((item, index) => {
            // Set color based on status
            switch (item.status) {
                case 'default':
                    ctx.fillStyle = '#3B82F6'; // blue
                    break;
                case 'comparing':
                    ctx.fillStyle = '#EF4444'; // red
                    break;
                case 'swap':
                    ctx.fillStyle = '#F59E0B'; // yellow
                    break;
                case 'potential-swap':
                    ctx.fillStyle = '#34D399'; // light green
                    break;
                case 'sorted':
                    ctx.fillStyle = '#10B981'; // dark green
                    break;
                default:
                    ctx.fillStyle = '#3B82F6'; // blue
            }

            // Draw the bar
            ctx.fillRect(
                index * barWidth,
                height - item.value,
                barWidth - 1,
                item.value
            );
        });
    }, [array]);

    // Define generateNewArray as useCallback to avoid dependency warnings
    const generateNewArray = useCallback(async (): Promise<void> => {
        // Internal definition of performShuffleAnimation to avoid circular dependency
        const performShuffleAnimation = async (arrayToShuffle: ArrayElement[]): Promise<void> => {
            // Number of shuffle steps - more steps = more dramatic shuffle
            const shuffleSteps = 15;
            const shuffleDelay = delayRef.current / 2;

            for (let step = 0; step < shuffleSteps; step++) {
                // Check if operation was cancelled
                if (!shufflingRef.current) return;

                // For each step, perform multiple random swaps
                const swapsPerStep = Math.ceil(arrayToShuffle.length / 3);

                for (let swap = 0; swap < swapsPerStep; swap++) {
                    const i = Math.floor(Math.random() * arrayToShuffle.length);
                    const j = Math.floor(Math.random() * arrayToShuffle.length);

                    // Skip if same index
                    if (i === j) continue;

                    if (!isFirstLoad) {
                        playSound(i, 100, isMuted);
                    }

                    // Mark elements as being shuffled
                    arrayToShuffle[i].status = 'comparing';
                    arrayToShuffle[j].status = 'swap';

                    // Swap values
                    const temp = arrayToShuffle[i].value;
                    arrayToShuffle[i].value = arrayToShuffle[j].value;
                    arrayToShuffle[j].value = temp;
                }

                // Update state with the shuffled array
                setArray([...arrayToShuffle]);
                arrayRef.current = [...arrayToShuffle];

                // Short delay to see the animation
                await sleep(shuffleDelay);

                // Reset status for next step
                arrayToShuffle.forEach(item => item.status = 'default');
            }

            // Final update with all statuses reset to default
            arrayToShuffle.forEach(item => item.status = 'default');

            // Generate final random values
            for (let i = 0; i < arrayToShuffle.length; i++) {
                arrayToShuffle[i].value = Math.floor(Math.random() * 300) + 10;
            }

            setArray([...arrayToShuffle]);
            arrayRef.current = [...arrayToShuffle];
        };

        // If we're sorting, stop the sorting operation
        if (sortingRef.current) {
            resetSorting();
            // Reset array status to default
            const resetArray: ArrayElement[] = arrayRef.current.map(item => ({
                value: item.value,
                status: 'default'
            }));
            setArray(resetArray);
            arrayRef.current = resetArray;
            await sleep(50); // Small delay to ensure sorting is stopped
        }

        // If we're already shuffling, return
        if (shufflingRef.current) return;

        setShuffling(true);
        shufflingRef.current = true;

        // Create initial array with current values or new ones if empty
        const initialArray: ArrayElement[] = arrayRef.current.length === numElements
            ? [...arrayRef.current].map(item => ({ ...item, status: 'default' as ElementStatus }))
            : Array.from({ length: numElements }, () => ({
                value: Math.floor(Math.random() * 300) + 10,
                status: 'default' as ElementStatus
            }));

        // If array length changed, create a new array
        if (arrayRef.current.length !== numElements) {
            const newArray: ArrayElement[] = [];
            for (let i = 0; i < numElements; i++) {
                newArray.push({
                    value: Math.floor(Math.random() * 300) + 10,
                    status: 'default'
                });
            }
            setArray(newArray);
            arrayRef.current = newArray;

            // Perform shuffle animation on the new array
            await performShuffleAnimation(newArray);
        } else {
            // Perform shuffle animation on the existing array
            await performShuffleAnimation(initialArray);
        }

        if (isFirstLoad) {
            setIsFirstLoad(false);
        }

        resetSorting();
        setShuffling(false);
        shufflingRef.current = false;
    }, [numElements, isFirstLoad, sleep, resetSorting, isMuted]);

    // Set algorithm based on URL path on initial load
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/bubble-sort')) {
            setAlgorithm('bubbleSort');
        } else if (path.includes('/selection-sort')) {
            setAlgorithm('selectionSort');
        } else if (path.includes('/shaker-sort')) {
            setAlgorithm('shakerSort');
        } else if (path.includes('/merge-sort')) {
            setAlgorithm('mergeSort');
        }
    }, [location.pathname]);

    // Cleanup function to stop any running operations when component unmounts or path changes
    useEffect(() => {
        return () => {
            // Stop sorting operations
            sortingRef.current = false;
            shufflingRef.current = false;

            // Reset state values that should be reset on navigation
            resetSorting();
        };
    }, [resetSorting]);

    // Update refs when state changes
    useEffect(() => {
        sortingRef.current = sorting;
        pausedRef.current = paused;
        delayRef.current = delay;
        arrayRef.current = array;
        comparisonsRef.current = comparisons;
        arrayAccessesRef.current = arrayAccesses;
        shufflingRef.current = shuffling;
    }, [sorting, paused, delay, array, comparisons, arrayAccesses, shuffling]);

    // Generate new array on mount and when numElements changes
    useEffect(() => {
        if (pendingOperationRef.current === 'elementChange') {
            pendingOperationRef.current = null;
            generateNewArray();
        }
    }, [numElements, generateNewArray]);

    // Draw the array whenever it changes
    useEffect(() => {
        drawArray();
    }, [array, drawArray]);

    useEffect(() => {
        generateNewArray();
    }, [generateNewArray]);

    const updateArrayItem = useCallback((index: number, newStatus: ElementStatus, newValue: number | null = null): void => {
        if (newStatus === "comparing") playSound(index, 50, isMuted);
        const newArray = [...arrayRef.current];
        newArray[index] = {
            value: newValue !== null ? newValue : newArray[index].value,
            status: newStatus
        };
        setArray(newArray);
        arrayRef.current = newArray;
    }, [isMuted]);

    const swap = useCallback((i: number, j: number): void => {
        const newArray = [...arrayRef.current];
        const temp = newArray[i].value;
        newArray[i].value = newArray[j].value;
        newArray[j].value = temp;

        // Play sounds for both swapped bars
        playSound(newArray[i].value, 100, isMuted);

        // Small delay between sounds to make them distinguishable
        setTimeout(() => {
            playSound(newArray[j].value, 100, isMuted);
        }, 30);

        setArray(newArray);
        arrayRef.current = newArray;

        // Update array accesses (2 reads + 2 writes)
        const newAccesses = arrayAccessesRef.current + 4;
        setArrayAccesses(newAccesses);
        arrayAccessesRef.current = newAccesses;
    }, [isMuted]);

    const handleStopAndPause = useCallback(async (): Promise<boolean> => {
        if (!sortingRef.current) return true;

        while (pausedRef.current) {
            await sleep(100);
            if (!sortingRef.current) return true;
        }

        await sleep(delayRef.current);
        return false;
    }, [sleep]);

    const isSorted = useCallback(async (el: ArrayElement[]): Promise<boolean> => {
        updateArrayItem(0, 'comparing');
        playSound(el[0].value, 100, isMuted);

        for (let i = 1; i < el.length; i++) {
            if (el[i - 1].value > el[i].value) return false;
            updateArrayItem(i - 1, 'sorted');
            updateArrayItem(i, 'comparing');
            playSound(el[i].value, 100, isMuted);
            await sleep(20);
        }

        updateArrayItem(el.length - 1, 'sorted');

        return true;
    }, [isMuted, updateArrayItem, sleep]);

    const startSorting = useCallback((): void => {
        if (sorting || shuffling) return;

        setSorting(true);
        sortingRef.current = true;
        setPaused(false);
        pausedRef.current = false;
        setComparisons(0);
        comparisonsRef.current = 0;
        setArrayAccesses(0);
        arrayAccessesRef.current = 0;

        // Reset any visualizations
        const resetArray = arrayRef.current.map(item => ({
            value: item.value,
            status: 'default' as ElementStatus
        }));
        setArray(resetArray);
        arrayRef.current = resetArray;

        // Start selected algorithm
        if (algorithm === 'selectionSort') {
            runSelectionSort({
                array: arrayRef.current,
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
            });
        } else if (algorithm === 'bubbleSort') {
            runBubbleSort({
                array: arrayRef.current,
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
            });
        } else if (algorithm === 'shakerSort') {
            runShakerSort({
                array: arrayRef.current,
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
            });
        } else if (algorithm === 'mergeSort') {
            runMergeSort({
                array: arrayRef.current,
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
            });
        }
    }, [algorithm, sorting, shuffling, updateArrayItem, swap, handleStopAndPause, isSorted]);

    const pauseResumeSorting = useCallback((): void => {
        const newPaused = !paused;
        setPaused(newPaused);
        pausedRef.current = newPaused;
    }, [paused]);

    const setSpeedMultiplier = useCallback((speedValue: string, multiplier: number): void => {
        setSpeed(speedValue);
        const newDelay = 100 / multiplier;
        setDelay(newDelay);
        delayRef.current = newDelay;
    }, []);

    const handleAlgorithmChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newAlgorithm = e.target.value as AlgorithmType;
        setAlgorithm(newAlgorithm);

        // Update the URL based on the selected algorithm
        let newPath = '/sorting/';
        if (newAlgorithm === 'bubbleSort') {
            newPath += 'bubble-sort';
        } else if (newAlgorithm === 'selectionSort') {
            newPath += 'selection-sort';
        } else if (newAlgorithm === 'shakerSort') {
            newPath += 'shaker-sort';
        } else if (newAlgorithm === 'mergeSort') {
            newPath += 'merge-sort';
        }

        // Navigate to the new URL without page refresh
        navigate(newPath, { replace: true });

        // If sorting, stop and reset only the colors, not the array
        if (sorting) {
            // Stop the sorting
            resetSorting();

            // Reset only the colors of the bars, not the array values
            const resetArray = arrayRef.current.map(item => ({
                value: item.value,
                status: 'default' as ElementStatus
            }));
            setArray(resetArray);
            arrayRef.current = resetArray;
        }
    }, [navigate, sorting, resetSorting]);

    const handleElementsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const newNumElements = Number(e.target.value);

        // If sorting, stop the sorting operation first
        if (sorting) {
            resetSorting();
        }

        // Set the pending operation to be handled after the state updates
        pendingOperationRef.current = 'elementChange';

        // Update the numElements state
        setNumElements(newNumElements);
    }, [sorting, resetSorting]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                    <p className="text-sm">Comparisons: <span>{comparisons}</span></p>
                    <p className="text-sm">Array Accesses: <span>{arrayAccesses}</span></p>
                    <p className="text-sm">Delay: <span>{delay.toFixed(0)}</span> ms</p>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-2 md:mt-0">
                    <div className="flex items-center">
                        <label className="mr-2 text-sm" htmlFor="algorithm">Sorting Algorithm:</label>
                        <select
                            translate="no"
                            id="algorithm"
                            className="border rounded px-2 py-1 text-sm"
                            value={algorithm}
                            onChange={handleAlgorithmChange}
                            disabled={shuffling}
                        >
                            <option value="selectionSort">Selection Sort</option>
                            <option value="bubbleSort">Bubble Sort</option>
                            <option value="shakerSort">Shaker Sort</option>
                            <option value="mergeSort">Merge Sort</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <label className="mr-2 text-sm" htmlFor="numElements">Elements:</label>
                        <select
                            id="numElements"
                            className="border rounded px-2 py-1 text-sm"
                            value={numElements}
                            onChange={handleElementsChange}
                            disabled={shuffling}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="border border-gray-300 bg-gray-100 w-4/5"
                />
            </div>

            <div className="mt-4">
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold">Options</h2>
                    <div className="flex space-x-2 mt-2">
                        <button
                            className={`px-3 py-1 rounded ${sorting || shuffling ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            onClick={startSorting}
                            disabled={sorting || shuffling}
                        >
                            Start Sorting
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${!sorting ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                            onClick={pauseResumeSorting}
                            disabled={!sorting}
                        >
                            {paused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${shuffling ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            onClick={generateNewArray}
                            disabled={shuffling}
                        >
                            {shuffling ? 'Shuffling...' : 'Generate New Array'}
                        </button>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-center text-md font-semibold">Speed</h3>
                        <div className="flex space-x-2 mt-2">
                            <button
                                className={`px-2 py-1 rounded text-sm ${speed === '0.5x' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => setSpeedMultiplier('0.5x', 0.5)}
                                disabled={shuffling}
                            >
                                0.50x
                            </button>
                            <button
                                className={`px-2 py-1 rounded text-sm ${speed === '1x' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => setSpeedMultiplier('1x', 1)}
                                disabled={shuffling}
                            >
                                1x
                            </button>
                            <button
                                className={`px-2 py-1 rounded text-sm ${speed === '4x' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => setSpeedMultiplier('4x', 4)}
                                disabled={shuffling}
                            >
                                4.00x
                            </button>
                            <button
                                className={`px-2 py-1 rounded text-sm ${speed === '100x' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => setSpeedMultiplier('100x', 100)}
                                disabled={shuffling}
                            >
                                100.00x
                            </button>
                        </div>
                    </div>

                    <AlgorithmDescription algorithm={algorithm} />
                </div>
            </div>
        </div>
    );
};

export default SortingVisualizer;