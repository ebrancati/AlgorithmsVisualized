import React from 'react';
import { AlgorithmType } from '../../types/pathfinding';
import { ALGORITHM_INFO } from '../../constants/pathfinding/index';

interface AlgorithmDescriptionProps {
    algorithm: AlgorithmType;
}

const AlgorithmDescription: React.FC<AlgorithmDescriptionProps> = ({ algorithm }) => {
    // Render HTML complexity with proper formatting for <strong> tags
    const renderComplexity = () => {
        return ALGORITHM_INFO[algorithm].complexity
            .split(/(<strong>.*?<\/strong>)/g)
            .map((part, index) =>
                part.startsWith("<strong>") && part.endsWith("</strong>") ? (
                    <strong key={index}>{part.replace(/<\/?strong>/g, "")}</strong>
                ) : (
                    part
                )
            );
    };

    return (
        <div className="mt-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                    {ALGORITHM_INFO[algorithm].name} Algorithm
                </h2>
                <p className="text-gray-700 mb-2">
                    {ALGORITHM_INFO[algorithm].description}
                </p>
                <h3 className="text-xl font-semibold text-green-500 mb-2">
                    Time and Space Complexity
                </h3>
                <p className="text-gray-700 mb-2">
                    {renderComplexity()}
                </p>
            </div>
        </div>
    );
};

export default AlgorithmDescription;