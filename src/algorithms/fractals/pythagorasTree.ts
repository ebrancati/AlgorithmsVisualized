/**
 * Vector class for 2D geometric operations used in fractal generation
 */
export class Vector {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mult(n: number): Vector {
        return new Vector(this.x * n, this.y * n);
    }

    div(n: number): Vector {
        return new Vector(this.x / n, this.y / n);
    }

    rotate(angle: number): Vector {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }
}

/**
 * Interface for rendering context used by the algorithm
 * This abstraction allows the algorithm to work with any rendering context
 * that provides these methods (canvas, SVG, etc.)
 */
export interface RenderContext {
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    closePath(): void;
    fill(): void;
    stroke(): void;
    
    // Properties
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
}

/**
 * Options for the Pythagoras Tree generation
 */
export interface PythagorasTreeOptions {
    depth: number;
    angle: number;
    colorByDepth?: boolean;
    baseHue?: number;
}

/**
 * Recursively draws the Pythagoras Tree fractal
 * 
 * @param ctx Rendering context to draw on
 * @param A Start point of the base line
 * @param B End point of the base line
 * @param depth Current recursion depth
 * @param angle Angle in radians for the rotation of branches
 * @param options Additional rendering options
 */
export const drawPythagorasTreeRecursive = (
    ctx: RenderContext, 
    A: Vector, 
    B: Vector, 
    depth: number, 
    angle: number,
    options: { baseHue?: number } = {}
): void => {
    // Create points C, D by rotating vectors at right angles from the base points
    const C = A.copy()
        .sub(B)
        .rotate(-Math.PI / 2)
        .add(B);
    const D = B.copy()
        .sub(A)
        .rotate(Math.PI / 2)
        .add(A);
    
    // Find the midpoint E between C and D, then calculate point F with rotation
    const E = C.copy().add(D).div(2);
    const F = C.copy().sub(E).rotate(angle).add(E);

    // Base case for recursion
    if (depth === 0) return;

    // Color based on depth - creates a visual gradient effect
    const baseHue = options.baseHue || 220; // Default to blue
    const hue = baseHue - depth * 10;
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;

    // Draw the shape
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.lineTo(D.x, D.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Continue recursion for the two branches
    drawPythagorasTreeRecursive(ctx, D, F, depth - 1, angle, options);
    drawPythagorasTreeRecursive(ctx, F, C, depth - 1, angle, options);
};

/**
 * Main function to generate a Pythagoras Tree
 * This is the entry point that prepares the canvas and starts the recursion
 * 
 * @param ctx The rendering context (canvas 2D context)
 * @param options Configuration options for the tree
 * @param width Width of the available drawing area
 * @param height Height of the available drawing area
 * @param offsetX X offset for translation
 * @param offsetY Y offset for translation
 * @param scale Zoom scale factor
 */
export const generatePythagorasTree = (
    ctx: RenderContext,
    options: PythagorasTreeOptions,
    width: number, 
    height: number,
): void => {
    // Calculate base size proportional to canvas dimensions
    const baseSize = Math.min(width, height) * 0.18;
    
    // Starting points for the base of the tree (centered)
    const startA = new Vector(-baseSize / 2, 0);
    const startB = new Vector(baseSize / 2, 0);
    
    // Start the recursive drawing
    drawPythagorasTreeRecursive(
        ctx, 
        startA, 
        startB, 
        options.depth, 
        options.angle,
        { baseHue: options.baseHue }
    );
};