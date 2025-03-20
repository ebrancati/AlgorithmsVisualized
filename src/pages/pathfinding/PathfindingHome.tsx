import React from 'react';
import { Link } from 'react-router-dom';

const PathfindingHome: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-8 bg-gray-100">
            <div className="max-w-4xl text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
                    Explore Pathfinding Algorithms
                </h2>
                <h3 className="text-lg sm:text-xl mb-6 text-gray-600">
                    Visualize and understand how pathfinding algorithms work in real-time.
                </h3>
                <p className="text-base sm:text-lg mb-8 text-gray-700 leading-relaxed">
                    Discover the inner workings of popular pathfinding algorithms. See how they navigate through mazes
                    and find the shortest paths, providing an intuitive understanding of their logic and efficiency.
                </p>
                <div translate="no" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        to="/pathfinding/dijkstra"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Dijkstra's Algorithm
                    </Link>
                    <Link
                        to="/pathfinding/astar"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        A* Algorithm
                    </Link>
                    <Link
                        to="/pathfinding/depth-first-search"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Depth-first search
                    </Link>
                    <Link
                        to="/pathfinding/bidirectional"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out text-center"
                    >
                        Bidirectional
                    </Link>
                </div>
                <p className="mt-8 text-gray-500 text-sm sm:text-base">
                    More pathfinding algorithms will be added soon!
                </p>
            </div>
        </div>
    );
};

export default PathfindingHome;