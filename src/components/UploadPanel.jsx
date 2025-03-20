import React, { useRef } from 'react';

function UploadPanel({ onImageUpload }) {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <div className="space-y-2">
                <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                </div>
                <div className="text-sm text-gray-600">
                    <span className="font-medium">Upload 360° photo</span>
                </div>
                <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full mt-2 px-3 py-2 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    Select File
                </button>
            </div>
        </div>
    );
}

export default UploadPanel;