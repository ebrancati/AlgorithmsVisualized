import React from 'react';
import { Link } from 'react-router-dom';

const SortingHome: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-8 bg-gray-100">
            <div className="max-w-4xl text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
                    Visualize Sorting Algorithms
                </h2>
                <h3 className="text-lg sm:text-xl mb-6 text-gray-600">
                    Explore and understand how sorting algorithms work through interactive visualizations.
                </h3>
                <p className="text-base sm:text-lg mb-8 text-gray-700 leading-relaxed">
                    Dive into the world of sorting algorithms and witness their execution in real-time.
                    See how different algorithms like Bubble Sort, Selection Sort, and others rearrange data,
                    providing an intuitive understanding of their efficiency and logic.
                </p>
                <div translate="no" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        to="/sorting/selection-sort"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Selection Sort
                    </Link>
                    <Link
                        to="/sorting/bubble-sort"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Bubble Sort
                    </Link>
                    <Link
                        to="/sorting/shaker-sort"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Shaker Sort
                    </Link>
                    <Link
                        to="/sorting/merge-sort"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Merge Sort
                    </Link>
                </div>
                <p className="mt-8 text-gray-500 text-sm sm:text-base">
                    More sorting algorithms will be added soon!
                </p>
            </div>
        </div>
    );
};

export default SortingHome;