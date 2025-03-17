import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home';
import SortingHome from './pages/sorting/SortingHome.tsx';
import PathfindingHome from './pages/pathfinding/PathfindingHome.tsx';
import PathfindingVisualizer from './pages/pathfinding/PathfindingVisualizer.tsx';

const App: React.FC = () => {
    return (
        <Router>
            <Header />
            <main className='flex-grow'>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sorting" element={<SortingHome />} />
                    <Route path="/pathfinding" element={<PathfindingHome />} />
                    <Route path="/pathfinding/dijkstra" element={<PathfindingVisualizer />} />
                    <Route path="/pathfinding/astar" element={<PathfindingVisualizer />} />
                    <Route path="/pathfinding/depth-first-search" element={<PathfindingVisualizer />} />
                    <Route path="/pathfinding/bidirectional" element={<PathfindingVisualizer />} />
                </Routes>
            </main>
            <Footer />
        </Router>
    );
};

export default App;