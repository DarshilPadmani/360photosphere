import React from 'react';

function Navbar({ activeTab, onTabChange }) {
    return (
        <header className="bg-white shadow">
            <div className="mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">360</span>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-800">Panorama Creator</h1>
                    </div>

                    <nav className="flex space-x-1">
                        <button
                            className={`px-3 py-2 text-sm rounded-md ${activeTab === 'capture' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                            onClick={() => onTabChange('capture')}
                        >
                            Capture
                        </button>
                        <button
                            className={`px-3 py-2 text-sm rounded-md ${activeTab === 'stitch' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                            onClick={() => onTabChange('stitch')}
                        >
                            Stitch
                        </button>
                        <button
                            className={`px-3 py-2 text-sm rounded-md ${activeTab === 'view' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                            onClick={() => onTabChange('view')}
                        >
                            View
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Navbar;