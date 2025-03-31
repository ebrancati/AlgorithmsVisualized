import React from 'react';

interface AlgorithmDescriptionProps {
    algorithm: string;
}

/**
 * Component that displays descriptive information about sorting algorithms
 */
const AlgorithmDescription: React.FC<AlgorithmDescriptionProps> = ({ algorithm }) => {
    return (
        <div className="mt-8 max-w-4xl mx-auto">
            {algorithm === 'selectionSort' && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-700 mb-2">Selection Sort Algorithm</h2>
                    <p className="mb-4 text-gray-700">
                        Selection Sort works by repeatedly finding the minimum element from the unsorted portion of the array and putting it at the beginning. This sorting algorithm is straightforward to implement and understand, making it perfect for educational purposes and small datasets.
                    </p>
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">Time Complexity Analysis</h3>
                    <p className="text-gray-700 mb-2">
                        Selection Sort maintains a consistent time complexity across all scenarios:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Best Case:</strong> O(n²)</li>
                        <li><strong>Average Case:</strong> O(n²)</li>
                        <li><strong>Worst Case:</strong> O(n²)</li>
                    </ul>
                    <p className="text-gray-700">
                        While not the most efficient for large datasets, its simplicity and minimal memory overhead (O(1) space complexity) make it useful in memory-constrained environments. Selection Sort performs fewer swaps compared to Bubble Sort, with exactly n-1 swaps required regardless of input arrangement.
                    </p>
                </div>
            )}

            {algorithm === 'bubbleSort' && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-700 mb-2">Bubble Sort Algorithm</h2>
                    <p className="mb-4 text-gray-700">
                        Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they're in the wrong order. The process continues until the entire array is sorted. This algorithm gets its name from the way smaller elements "bubble" to the top of the list through a series of swaps.
                    </p>
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">Time Complexity Analysis</h3>
                    <p className="text-gray-700 mb-2">
                        Bubble Sort has varying time complexity depending on the input arrangement:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Best Case:</strong> O(n) - when array is already sorted</li>
                        <li><strong>Average Case:</strong> O(n²)</li>
                        <li><strong>Worst Case:</strong> O(n²) - when array is sorted in reverse order</li>
                    </ul>
                    <p className="text-gray-700">
                        While not suitable for large datasets due to its quadratic time complexity, Bubble Sort excels in detecting nearly sorted arrays quickly. Its in-place operation requires only O(1) additional memory, and its stability preserves the relative order of equal elements.
                    </p>
                </div>
            )}

            {algorithm === 'shakerSort' && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-700 mb-2">Shaker Sort Algorithm</h2>
                    <p className="mb-4 text-gray-700">
                        Shaker Sort (also known as Cocktail Sort) is a variation of Bubble Sort that sorts in both directions. This bidirectional approach addresses the "turtle problem" found in traditional Bubble Sort, where small elements at the end move very slowly toward their correct position when sorting in one direction only.
                    </p>
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">Time Complexity Analysis</h3>
                    <p className="text-gray-700 mb-2">
                        Shaker Sort maintains similar time complexity to Bubble Sort with some practical improvements:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Best Case:</strong> O(n) - when array is already sorted</li>
                        <li><strong>Average Case:</strong> O(n²)</li>
                        <li><strong>Worst Case:</strong> O(n²)</li>
                    </ul>
                    <p className="text-gray-700">
                        Shaker Sort often outperforms standard Bubble Sort on partially sorted arrays by efficiently moving both small and large elements to their correct positions. It maintains O(1) space complexity and preserves stability, making it useful for educational visualization and small to medium datasets with some pre-existing order.
                    </p>
                </div>
            )}

            {algorithm === 'mergeSort' && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-700 mb-2">Merge Sort Algorithm</h2>
                    <p className="mb-4 text-gray-700">
                        Merge Sort is an efficient, stable, comparison-based, divide and conquer algorithm. It works by dividing the input array into two halves, recursively sorting them, and then merging the sorted halves back together. This elegant approach produces a fully sorted array.
                    </p>
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">Time Complexity Analysis</h3>
                    <p className="text-gray-700 mb-2">
                        Merge Sort offers consistent performance regardless of the input data distribution:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Best Case:</strong> O(n log n)</li>
                        <li><strong>Average Case:</strong> O(n log n)</li>
                        <li><strong>Worst Case:</strong> O(n log n)</li>
                    </ul>
                    <p className="text-gray-700 mb-2">
                        Unlike the simpler algorithms, Merge Sort guarantees O(n log n) time complexity in all cases, making it much more efficient for large datasets. However, this comes with some trade-offs:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Space Complexity:</strong> O(n) - requires additional memory for the merging process</li>
                        <li><strong>Stability:</strong> Stable - preserves the relative order of equal elements</li>
                    </ul>
                    <p className="text-gray-700">
                        Merge Sort is widely used in practical applications because of its reliability and predictable performance. It's particularly valuable when stability is important and when working with linked lists, where it can be implemented with O(1) extra space.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AlgorithmDescription;