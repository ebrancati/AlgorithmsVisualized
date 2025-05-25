import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from '../../components/fractals/Slider';
import { playFractalSound as playSound} from '../../utils/audioUtils';
import { generatePythagorasTree } from '../../algorithms/fractals/pythagorasTree';

const PythagorasTreePage: React.FC = () => {
    // Refs for canvas and controls
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTimeRef = useRef<HTMLSpanElement>(null);
    const elementsCountRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // State for tree properties
    const [depth, setDepth] = useState<number>(5);
    const [angle, setAngle] = useState<number>(90);
    const [showPerformanceWarning, setShowPerformanceWarning] = useState<boolean>(false);

    // State for canvas panning
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panPosition, setPanPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const lastPanPointRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    // State for zoom
    const [scale, setScale] = useState<number>(1.0);

    // Refs for tree properties
    const currentDepthRef = useRef<number>(5);
    const currentAngleRef = useRef<number>(Math.PI / 2); // 90 degrees in radians
    const isDrawingRef = useRef<boolean>(false);
    const needsUpdateRef = useRef<boolean>(true);
    const treeCacheRef = useRef<{ [key: string]: ImageData }>({});

    /**
     * Main drawing function with caching mechanism for performance optimization
     */
    const drawTree = useCallback(() => {
        if (!needsUpdateRef.current || isDrawingRef.current || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const renderStartTime = performance.now();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Only cache recursion depths 13, 14, 15
        const shouldCache = currentDepthRef.current >= 13;
        
        // Create unique cache key based on all parameters that affect rendering
        const cacheKey = `${currentDepthRef.current}_${currentAngleRef.current.toFixed(2)}_${canvas.width}_${canvas.height}_${panPosition.x.toFixed(0)}_${panPosition.y.toFixed(0)}_${scale.toFixed(2)}`;
        
        const elementsCount = currentDepthRef.current === 0 
            ? 0 
            : Math.pow(2, currentDepthRef.current) - 1;

        if (elementsCountRef.current) {
            elementsCountRef.current.textContent = elementsCount.toLocaleString();
        }

        // Check cache only if depth is >= 13
        if (shouldCache && treeCacheRef.current[cacheKey]) {
            ctx.putImageData(treeCacheRef.current[cacheKey], 0, 0);
            
            const renderEndTime = performance.now();
            if (renderTimeRef.current) {
                renderTimeRef.current.textContent = Math.round(renderEndTime - renderStartTime) + ' ms (cached)';
            }
            
            needsUpdateRef.current = false;
            return;
        }
        
        isDrawingRef.current = true;
        
        // Set origin at bottom center and apply panning offset and zoom
        ctx.save();
        ctx.translate(canvas.width / 2 + panPosition.x, canvas.height * 0.95 + panPosition.y);
        ctx.scale(scale, -scale);
        
        generatePythagorasTree(
            ctx,
            {
                depth: currentDepthRef.current,
                angle: currentAngleRef.current,
                baseHue: 220
            },
            canvas.width,
            canvas.height
        );

        ctx.restore();
        
        // Cache the result only for higher recursion depths
        if (shouldCache) {
            treeCacheRef.current[cacheKey] = ctx.getImageData(0, 0, canvas.width, canvas.height);
           
            // Limit cache to about 3 elements
            const keys = Object.keys(treeCacheRef.current);
            if (keys.length > 5) {
                delete treeCacheRef.current[keys[0]];
            }
        }
        
        const renderEndTime = performance.now();
        if (renderTimeRef.current) {
            renderTimeRef.current.textContent = Math.round(renderEndTime - renderStartTime) + ' ms';
        }
        
        isDrawingRef.current = false;
        needsUpdateRef.current = false;
    }, [panPosition, scale]);

    /**
     * Toggles fullscreen mode with modern API
     */
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Mouse event handlers for panning
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (canvasRef.current) {
            setIsPanning(true);
            lastPanPointRef.current = { x: e.clientX, y: e.clientY };
            canvasRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning) {
            const dx = e.clientX - lastPanPointRef.current.x;
            const dy = e.clientY - lastPanPointRef.current.y;

            setPanPosition(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));

            lastPanPointRef.current = { x: e.clientX, y: e.clientY };
            needsUpdateRef.current = true;
            requestAnimationFrame(drawTree);
        }
    };

    const handleMouseUp = () => {
        if (isPanning && canvasRef.current) {
            canvasRef.current.style.cursor = 'grab';
            setIsPanning(false);
        }
    };

    // Touch event handlers for mobile panning
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (e.touches.length === 1) {
            setIsPanning(true);
            lastPanPointRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (isPanning && e.touches.length === 1) {
            e.preventDefault();

            const dx = e.touches[0].clientX - lastPanPointRef.current.x;
            const dy = e.touches[0].clientY - lastPanPointRef.current.y;

            setPanPosition(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));

            lastPanPointRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            needsUpdateRef.current = true;
            requestAnimationFrame(drawTree);
        }
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
    };

    /**
     * Resets the view to the initial state (centered, default zoom)
     */
    const handleResetView = useCallback(() => {
        setPanPosition({ x: 0, y: 0 });
        setScale(1.0);
        treeCacheRef.current = {};

        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height * 0.95);
                ctx.scale(1, -1);

                generatePythagorasTree(
                    ctx, 
                    { 
                        depth: currentDepthRef.current, 
                        angle: currentAngleRef.current,
                        baseHue: 220
                    },
                    canvas.width,
                    canvas.height
                );

                ctx.restore();
            }
        }
    }, []);

    // Canvas initialization and event listeners
    useEffect(() => {
        // Initial draw
        drawTree();

        // Animation frame for continuous drawing
        let animationFrameId: number;
        const updateCanvas = () => {
            drawTree();
            animationFrameId = requestAnimationFrame(updateCanvas);
        };

        // Document mouse up handler for panning outside canvas
        const handleDocumentMouseUp = () => {
            if (isPanning && canvasRef.current) {
                canvasRef.current.style.cursor = 'grab';
                setIsPanning(false);
            }
        };

        document.addEventListener('mouseup', handleDocumentMouseUp);
        animationFrameId = requestAnimationFrame(updateCanvas);

        return () => {
            document.removeEventListener('mouseup', handleDocumentMouseUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPanning, drawTree]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Link
                    to="/fractals"
                    className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Fractals
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-blue-700 mb-4">Pythagoras Tree</h1>
            <p className="text-lg mb-6">
                A classic example of a mathematical fractal constructed with squares.
                Adjust the parameters below to explore different variations.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col gap-8">
                    <div className="w-full flex items-center justify-center mt-4 relative">
                        <div
                            ref={containerRef}
                            className={`p-2 border border-gray-300 bg-gray-50 rounded-lg shadow-inner w-full relative ${document.fullscreenElement ? 'h-screen flex items-center justify-center' : ''}`}
                        >
                            <canvas
                                ref={canvasRef}
                                width="800"
                                height="600"
                                className="bg-white rounded w-full cursor-grab active:cursor-grabbing"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            />

                            {/* Pan instructions */}
                            <div className="absolute bottom-3 right-3 z-10 flex gap-2 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="bg-white px-3 py-1 rounded-full text-xs shadow text-gray-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                    </svg>
                                    Click and drag to pan
                                </div>
                            </div>

                            {/* Zoom and fullscreen controls */}
                            <div className="absolute top-3 right-3 z-10 flex gap-2">
                                {/* Zoom In */}
                                <button
                                    onClick={() => {
                                        const newScale = Math.min(scale + 0.1, 5);
                                        setScale(newScale);
                                        treeCacheRef.current = {};
                                        needsUpdateRef.current = true;
                                        requestAnimationFrame(drawTree);
                                    }}
                                    className="bg-white w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="Zoom In"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>

                                {/* Zoom Out */}
                                <button
                                    onClick={() => {
                                        const newScale = Math.max(scale - 0.1, 0.5);
                                        setScale(newScale);
                                        treeCacheRef.current = {};
                                        needsUpdateRef.current = true;
                                        requestAnimationFrame(drawTree);
                                    }}
                                    className="bg-white w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="Zoom Out"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                    </svg>
                                </button>

                                {/* Zoom indicator */}
                                <div className="bg-white px-3 h-8 rounded-full shadow flex items-center text-xs text-gray-700">
                                    {Math.round(scale * 100)}%
                                </div>

                                {/* Fullscreen button */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="bg-white w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title={document.fullscreenElement ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {document.fullscreenElement ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <Slider
                        label="Recursion Depth"
                        value={depth}
                        onChange={(newDepth) => {
                            playSound(newDepth);
                            if (newDepth !== currentDepthRef.current) {
                                setDepth(newDepth);
                                currentDepthRef.current = newDepth;
                                needsUpdateRef.current = true;
                                requestAnimationFrame(drawTree);
                            }
                        }}
                        min={0}
                        max={15}
                        markers={[
                            { value: 0, label: "0" },
                            { value: 5, label: "5" },
                            { value: 10, label: "10" },
                            { value: 15, label: "15" }
                        ]}
                    />

                    <Slider
                        label="Rotation Angle"
                        value={angle}
                        onChange={(newAngle) => {
                            // Show warning if depth is high
                            if (depth > 12) {
                                setShowPerformanceWarning(true);
                                setTimeout(() => setShowPerformanceWarning(false), 7000);
                            }

                            const newAngleRadians = newAngle * Math.PI / 180;
                            if (newAngleRadians !== currentAngleRef.current) {
                                setAngle(newAngle);
                                currentAngleRef.current = newAngleRadians;
                                needsUpdateRef.current = true;
                                requestAnimationFrame(drawTree);
                            }
                        }}
                        min={0}
                        max={180}
                        markers={[
                            { value: 0, label: "0°" },
                            { value: 90, label: "90°" },
                            { value: 180, label: "180°" }
                        ]}
                        unit="°"
                    />

                    {showPerformanceWarning && (
                        <div className="fixed top-4 right-4 z-50 max-w-sm">
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Performance Warning
                                        </h3>
                                        <div className="mt-1 text-xs text-yellow-700">
                                            <p>
                                                Performance warning! Changing angles with recursion depth above 12 may cause slow rendering.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-auto pl-3">
                                        <button
                                            onClick={() => setShowPerformanceWarning(false)}
                                            className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full inline-flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Render Time: <span ref={renderTimeRef} className="ml-1 font-medium">0 ms</span>
                        </div>

                        <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full inline-flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" />
                            </svg>
                            Elements: <span ref={elementsCountRef} className="ml-1 font-medium">0</span>
                        </div>
                        
                        <button
                            onClick={handleResetView}
                            className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full transition-colors duration-200 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Reset View
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-blue-700 mb-4">How It Works</h2>
                <p className="text-gray-700 mb-4">
                    The Pythagoras Tree starts with a square. At each step of the algorithm, two smaller
                    squares are placed on top of each existing square, forming a right triangle. This
                    process repeats recursively, creating a tree-like fractal pattern.
                </p>
                <p className="text-gray-700 mb-4">
                    The angle parameter determines the angle between the two new squares. When set to 90°,
                    the tree forms a classic balanced shape. Varying the angle creates different aesthetic
                    patterns and branch distributions.
                </p>
                <p className="text-gray-700">
                    The depth parameter controls how many recursive iterations are performed. Higher values
                    create more detailed trees but require more computational power.
                </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-blue-700 mb-4">Mathematical Properties</h2>
                <p className="text-gray-700 mb-4">
                    The Pythagoras Tree is a fractal that visually demonstrates the <strong>Pythagorean theorem</strong> in its construction.
                    At each step, two smaller squares are placed on the sides of a right triangle, with their hypotenuse aligning with a side
                    of the larger square below. This arrangement represents the equation:
                </p>

                <div
                    className="text-4xl font-serif text-center my-4"
                    role="math"
                    aria-label="a squared plus b squared equals c squared"
                >
                    a<sup className="text-xl">2</sup> +
                    b<sup className="text-xl">2</sup> =
                    c<sup className="text-xl">2</sup>
                </div>

                <p className="text-gray-700 mb-4">
                    Despite its infinite structure, the Pythagoras Tree has a finite area because the total area of newly
                    added squares decreases with each iteration. However, its perimeter is infinite, a common property of many fractals.
                </p>
                <p className="text-gray-700">
                    The fractal dimension of the standard Pythagoras Tree is approximately 2, meaning that,
                    when iterated infinitely, it almost fills the 2D plane without completely covering it.
                </p>
            </div>
        </div>
    );
};

export default PythagorasTreePage;