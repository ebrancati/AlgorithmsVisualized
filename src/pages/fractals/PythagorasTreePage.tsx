import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Slider from '../../components/fractals/Slider';
import { playFractalSound as playSound} from '../../utils/audioUtils';
import { generatePythagorasTree } from '../../algorithms/fractals/pythagorasTree';

/**
 * Extends the standard Document interface to support cross-browser fullscreen functionality.
 * Different browsers implemented fullscreen features with vendor prefixes:
 * - Mozilla (Firefox): mozFullScreenElement, mozCancelFullScreen
 * - WebKit (Safari, older Chrome): webkitFullscreenElement, webkitExitFullscreen
 * - Microsoft (IE/Edge): msFullscreenElement, msExitFullscreen
 */
interface FullscreenDocument extends Document {
    mozFullScreenElement?: Element;
    webkitFullscreenElement?: Element;
    msFullscreenElement?: Element;
    mozCancelFullScreen?: () => void;
    webkitExitFullscreen?: () => void;
    msExitFullscreen?: () => void;
}

interface FullscreenElement extends HTMLDivElement {
    mozRequestFullScreen?: () => void;
    webkitRequestFullscreen?: () => void;
    msRequestFullscreen?: () => void;
}

const PythagorasTreePage: React.FC = () => {
    // Refs for canvas and controls
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTimeRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resetButtonRef = useRef<HTMLButtonElement>(null);

    // State for tree properties
    const [depth, setDepth] = useState<number>(5);
    const [angle, setAngle] = useState<number>(90);

    // State for canvas panning
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panPosition, setPanPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const lastPanPointRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    // State for zoom and fullscreen
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Refs for tree properties
    const currentDepthRef = useRef<number>(5);
    const currentAngleRef = useRef<number>(Math.PI / 2); // 90 degrees in radians
    const isDrawingRef = useRef<boolean>(false);
    const needsUpdateRef = useRef<boolean>(true);
    const treeCacheRef = useRef<{ [key: string]: ImageData }>({});

    /**
     * Main drawing function with caching mechanism for performance optimization
     * Only redraws when parameters change, otherwise reuses cached image data
     */
    const drawTree = useCallback(() => {
        if (!needsUpdateRef.current || isDrawingRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create unique cache key based on all parameters that affect rendering
        const cacheKey = `${currentDepthRef.current}_${currentAngleRef.current.toFixed(2)}_${canvas.width}_${canvas.height}_${panPosition.x.toFixed(0)}_${panPosition.y.toFixed(0)}_${scale.toFixed(2)}`;

        if (treeCacheRef.current[cacheKey]) {
            ctx.putImageData(treeCacheRef.current[cacheKey], 0, 0);
            needsUpdateRef.current = false;
            return;
        }

        isDrawingRef.current = true;
        const renderStartTime = performance.now();

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

        // Cache the result for future reuse
        treeCacheRef.current[cacheKey] = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Manage cache size (limit to 10 entries)
        const keys = Object.keys(treeCacheRef.current);
        if (keys.length > 10) {
            delete treeCacheRef.current[keys[0]];
        }

        const renderEndTime = performance.now();
        if (renderTimeRef.current) {
            renderTimeRef.current.textContent = Math.round(renderEndTime - renderStartTime) + ' ms';
        }

        isDrawingRef.current = false;
        needsUpdateRef.current = false;

    }, [panPosition, scale]);

    /**
     * Handles canvas resizing, with special handling for fullscreen mode and mobile devices
     */
    const resizeCanvas = useCallback(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;

        if (isFullscreen) {
            // In fullscreen mode, use all available space
            canvas.width = window.innerWidth - 40; // Margin to avoid scrollbars
            canvas.height = window.innerHeight - 40;
        } else {
            // Normal dimensions
            const containerWidth = window.innerWidth - 60; // Full width with some padding
            canvas.width = containerWidth;

            // Calculate appropriate height for mobile devices
            const isMobile = window.innerWidth < 768; // Standard breakpoint for mobile
            const maxHeight = isMobile ?
                Math.min(400, window.innerHeight - 350) : // Reduced height for mobile
                Math.max(600, window.innerHeight - 300);  // Standard height for desktop

            canvas.height = maxHeight;
        }

        // Clear cache when resizing
        treeCacheRef.current = {};
        needsUpdateRef.current = true;
    }, [isFullscreen]);

    /**
     * Toggles fullscreen mode with cross-browser support
     */
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        const fullscreenContainer = containerRef.current as FullscreenElement;
        const doc = document as FullscreenDocument;

        if (!isFullscreen) {
            if (fullscreenContainer.requestFullscreen) {
                fullscreenContainer.requestFullscreen();
            } else if (fullscreenContainer.mozRequestFullScreen) { // Firefox
                fullscreenContainer.mozRequestFullScreen();
            } else if (fullscreenContainer.webkitRequestFullscreen) { // Chrome, Safari, Opera
                fullscreenContainer.webkitRequestFullscreen();
            } else if (fullscreenContainer.msRequestFullscreen) { // IE/Edge
                fullscreenContainer.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen mode
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
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

    // Prevent default behavior to avoid unwanted browser actions
    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (isPanning && e.touches.length === 1) {
            // Prevent page scrolling during pan
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
     * Also clears the cache to ensure a clean redraw
     */
    const handleResetView = useCallback(() => {
        setPanPosition({ x: 0, y: 0 });

        // Reset zoom to default
        setScale(1.0);

        // Remove cache completely
        treeCacheRef.current = {};

        // Force immediate redraw, bypassing the caching mechanism
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear canvas completely
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw tree directly with pan position at 0,0
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height * 0.95);
                ctx.scale(1, -1); // Reset to default scale

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

            setTimeout(() => {
                // trick to force a re-render, slightly modify and then restore the scale value
                setScale(0.999);
                setTimeout(() => setScale(1.0), 10);
            }, 10);
        }


    }, [setPanPosition, setScale]);

    // Listen for fullscreen changes
    useEffect(() => {
        const doc = document as FullscreenDocument;
        
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                doc.fullscreenElement ||
                doc.mozFullScreenElement ||
                doc.webkitFullscreenElement ||
                doc.msFullscreenElement
            );

            setIsFullscreen(isCurrentlyFullscreen);

            // When exiting fullscreen, make sure to resize canvas
            if (!isCurrentlyFullscreen) {
                setTimeout(() => {
                    resizeCanvas();
                    needsUpdateRef.current = true;
                    requestAnimationFrame(drawTree);
                }, 100); // Small delay to ensure DOM is updated
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [drawTree, resizeCanvas]);

    // Canvas initialization and event listeners
    useEffect(() => {
        // Initial resize and draw
        resizeCanvas();
        drawTree();

        // Handle window resize
        const handleResize = () => {
            resizeCanvas();
            needsUpdateRef.current = true;
            requestAnimationFrame(drawTree);
        };

        window.addEventListener('resize', handleResize);

        // Animation frame for continuous drawing if needed
        let animationFrameId: number;

        const updateCanvas = () => {
            drawTree();
            animationFrameId = requestAnimationFrame(updateCanvas);
        };

        // Set document-level event handler to capture mouseup events outside the canvas
        const handleDocumentMouseUp = () => {
            if (isPanning && canvasRef.current) {
                canvasRef.current.style.cursor = 'grab';
                setIsPanning(false);
            }
        };

        document.addEventListener('mouseup', handleDocumentMouseUp);

        animationFrameId = requestAnimationFrame(updateCanvas);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mouseup', handleDocumentMouseUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPanning, isFullscreen, drawTree, resizeCanvas]);

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
                            className={`p-2 border border-gray-300 bg-gray-50 rounded-lg shadow-inner w-full relative ${isFullscreen ? 'h-screen flex items-center justify-center' : ''}`}
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
                                onClick={() => {
                                    // Force redraw when canvas is clicked
                                    needsUpdateRef.current = true;
                                    requestAnimationFrame(drawTree);
                                }}
                            ></canvas>

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
                                {/* Zoom controls for examining fractal detail */}
                                <button
                                    onClick={() => {
                                        const newScale = Math.min(scale + 0.1, 5);
                                        setScale(newScale);

                                        treeCacheRef.current = {};
                                        needsUpdateRef.current = true;

                                        drawTree();

                                        requestAnimationFrame(drawTree);
                                    }}
                                    className="bg-white w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="Zoom In"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>

                                {/* Zoom Out button */}
                                <button
                                    onClick={() => {
                                        const newScale = Math.max(scale - 0.1, 0.5);
                                        setScale(newScale);

                                        treeCacheRef.current = {};
                                        needsUpdateRef.current = true;

                                        drawTree();

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
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? (
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

                    <div className="flex justify-between items-center mb-6">
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full inline-flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Render Time: <span ref={renderTimeRef} className="ml-1 font-medium">0 ms</span>
                        </div>

                        <button
                            ref={resetButtonRef}
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