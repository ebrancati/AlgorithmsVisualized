import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-8 bg-gray-100">
            <div className="max-w-4xl text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
                    Visualize Algorithms in Action
                </h2>
                <h3 className="text-lg sm:text-xl mb-6 text-gray-600">
                    An interactive platform to explore and learn fundamental algorithms through real-time visualizations.
                </h3>
                <p className="text-base sm:text-lg mb-8 text-gray-700 leading-relaxed">
                    Here, you can explore the inner workings of various algorithms, observing in real-time how data is manipulated
                    and reorganized. Whether you're a student, programmer, or simply curious, this tool will help you better understand
                    fundamental computer science concepts in an intuitive and fun way.
                </p>
                <div translate="no" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/sorting" className="inline-block">
                        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out">
                            Sorting Visualizer
                        </button>
                    </Link>
                    <Link to="/pathfinding" className="inline-block">
                        <button className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out">
                            Pathfinding Visualizer
                        </button>
                    </Link>
                    <Link to="/fractals" className="inline-block sm:col-span-2 sm:w-1/2 sm:mx-auto">
                        <button className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out">
                            Fractals
                        </button>
                    </Link>
                </div>
                <p className="mt-8 text-gray-500 text-sm sm:text-base">
                    More algorithms are coming soon!
                </p>
            </div>
        </div>
    );
};

export default Home;