import React from "react";

const Footer: React.FC = () => {
    const githubLink = "https://github.com/ebrancati/";

    return (
        <footer className="bg-gray-800 text-gray-400 text-sm py-4 border-t border-gray-700">
            <div className="container mx-auto text-center">
                <p>
                    Feel free to contribute ❤ Check out the project on{" "}
                    <a
                        href={githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                    >
                        GitHub
                    </a>
                    .
                </p>
            </div>
        </footer>
    );
};

export default Footer;