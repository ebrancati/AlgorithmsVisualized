# Algorithms Visualized

An interactive web application for visualizing and learning about fundamental computer science algorithms through real-time visualizations.

This project is designed for students, programmers, and anyone curious to see algorithms "in action". It currently includes:

- **Sorting Algorithms**: Selection Sort, Bubble Sort, Shaker Sort, Merge Sort
- **Pathfinding Algorithms**: Dijkstra's Algorithm, A*, Depth-First Search, Bidirectional Search
- **Fractals**: Pythagoras Tree

## How to Contribute

Want to add a new visualization or improve existing code? Great! Here's how:

### Initial Setup

1. Clone the repository:
   ```
   git clone https://github.com/ebrancati/AlgorithmsVisualized.git
   cd AlgorithmsVisualized
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`

### Project Structure

The project is organized so that each type of algorithm has its dedicated files, making it easy to add new visualizations.

```
src/
│
├── algorithms/               # Algorithm implementations
│   ├── pathfinding/          # Path search algorithms
│   ├── sorting/              # Sorting algorithms
│   └── fractals/             # Algorithms for generating fractals
│
├── components/               # Reusable UI components
│   ├── fractals/             # Fractal-specific components
│   ├── pathfinding/          # Pathfinding-specific components
│   └── sorting/              # Sorting-specific components
│
├── pages/                    # Application pages
│   ├── fractals/             # Fractal visualization pages
│   ├── pathfinding/          # Pathfinding visualization pages
│   └── sorting/              # Sorting visualization pages
│
├── utils/                    # Utility functions
│   ├── audioUtils.ts         # Audio generation for algorithms
│   └── pathfinding/          # Pathfinding utilities
│
└── types/                    # TypeScript type definitions
```

### Key Principle: Separation Between Algorithms and UI

An important principle in this project is to keep the algorithm implementation separate from its visualization:

- **Pure algorithms** go in the `algorithms/` folder
- **Visualization components** go in the `components/` folder
- **Pages** that use them go in the `pages/` folder

### How to Add a New Algorithm

1. **Choose the category** (sorting, pathfinding, fractals, etc.)
2. **Create the algorithm implementation** in the appropriate folder in `algorithms/`
3. **Create necessary visualization components** in `components/` (if needed)
4. **Integrate the algorithm into the existing page or create a new page**:
   - For sorting: Add to the existing `SortingVisualizer.tsx` page which supports multiple algorithms
   - For pathfinding: Add to the existing `PathfindingVisualizer.tsx` page which supports multiple algorithms
   - For fractals: Usually requires a new dedicated page (like `PythagorasTreePage.tsx`)
5. **Add routing** in `App.tsx` if needed (may not be necessary for sorting and pathfinding)
6. **Update the category's home page** to include the new algorithm

### Example: Adding a New Sorting Algorithm

Let's say we want to add Quick Sort to our visualization project:

1. **Create the algorithm implementation file** in the appropriate algorithms folder
   - Define the main sorting function and helper functions like partition
   - Implement visualization hooks for showing the pivot selection and partitioning

2. **Add the new algorithm to the exports** in the index file so it's available throughout the application

3. **Create an algorithm description** that explains:
   - How Quick Sort works (selecting a pivot and partitioning)
   - Its time complexity (best: O(n log n), average: O(n log n), worst: O(n²))
   - Advantages and disadvantages compared to other sorting algorithms

4. **Update the algorithm selection UI** to include Quick Sort as an option in the dropdown

5. **Add handling for the new algorithm** in the main sorting function to call Quick Sort when selected

6. **Create a navigation link** to Quick Sort on the main sorting page

7. **Add the appropriate routing** in the app configuration

This process keeps the algorithm implementation separate from the visualization, following the project's architecture pattern.

### Code Guidelines

- Use TypeScript for all new code
- Follow existing code style
- Add comments to explain complex parts
- Make sure the visualization is responsive

## Submitting a Pull Request

1. Create a branch for your feature:
   ```
   git checkout -b feature/feature-name
   ```

2. Commit your changes with descriptive messages:
   ```
   git commit -m "feat: add Breadth-First Search algorithm"
   ```

3. Push the branch:
   ```
   git push origin feature/feature-name
   ```

4. Open a Pull Request on the GitHub repository

## Any Questions?

If you have questions or need help, open an issue on GitHub or contact me at enzo.brancati04@gmail.com

Thank you for your interest in improving Algorithms Visualized! ❤