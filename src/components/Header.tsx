import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
    const location = useLocation();

    return (
        <header className="bg-gray-800 text-white py-4 shadow-md relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <h1 className="text-2xl font-bold mb-4 md:mb-0">Algorithms Visualized</h1>

                    <nav className="flex flex-col md:flex-row gap-4 md:gap-6 items-center w-full md:w-auto">
                        {[{ to: "/", label: "Home" }, { to: "/sorting", label: "Sorting" }, { to: "/pathfinding", label: "Pathfinding" }].map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative text-lg font-medium transition duration-300 ${link.to === "/" && location.pathname === "/" ||
                                    link.to === "/sorting" && location.pathname.startsWith("/sorting") && !location.pathname.startsWith("/sorting/") ||
                                    link.to === "/pathfinding" && location.pathname.startsWith("/pathfinding") && !location.pathname.startsWith("/pathfinding/") ||
                                    location.pathname.startsWith(link.to) && link.to !== "/"
                                    ? "text-blue-400 after:w-full"
                                    : "text-gray-300 hover:text-white"
                                    } after:block after:h-0.5 after:bg-blue-400 after:transition-all after:duration-300 after:w-0 hover:after:w-full`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;