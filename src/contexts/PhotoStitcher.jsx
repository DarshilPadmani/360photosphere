import React, { useState, useEffect, useRef } from 'react';
import { usePanorama } from './PanoramaContext';

function PhotoStitcher({ onSavePanorama }) {
    const { capturedPhotos, resetCapture } = usePanorama();
    const [panoramaName, setPanoramaName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (capturedPhotos.length > 0) {
            // For demo purposes, show a preview of the first photo
            setPreviewImage(capturedPhotos[0].data);
        }
    }, [capturedPhotos]);

    const processPhotos = () => {
        if (capturedPhotos.length < 6) {
            alert('Please capture at least 6 photos for a good panorama.');
            return;
        }

        setIsProcessing(true);

        // Simulate photo stitching process with progress updates
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setProcessingProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);
                simulateStitching();
            }
        }, 200);
    };

    const simulateStitching = () => {
        // In a real app, we would use a proper stitching algorithm
        // For this demo, we'll create a simple equirectangular panorama by placing photos side by side

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas to appropriate size for equirectangular panorama
        canvas.width = 4096;
        canvas.height = 2048;

        // Fill with black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const photoPromises = capturedPhotos.map((photo) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = photo.data;
            });
        });

        Promise.all(photoPromises).then((images) => {
            // Simple equirectangular layout (this is a simplified simulation, not true stitching)
            const photoWidth = canvas.width / 4;
            const photoHeight = canvas.height / 3;

            images.forEach((img, index) => {
                const row = Math.floor(index / 4);
                const col = index % 4;
                const x = col * photoWidth;
                const y = row * photoHeight;

                ctx.drawImage(img, x, y, photoWidth, photoHeight);
            });

            // Convert canvas to data URL for the panorama
            const panoramaUrl = canvas.toDataURL('image/jpeg');
            setPreviewImage(panoramaUrl);
            setIsProcessing(false);
        });
    };

    const handleSave = () => {
        const name = panoramaName.trim() || `Panorama ${new Date().toLocaleString()}`;

        onSavePanorama({
            name,
            url: previewImage,
            createdAt: new Date().toISOString(),
            photoCount: capturedPhotos.length
        });

        // Reset after saving
        resetCapture();
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Create 360° Panorama</h2>
                <p className="text-gray-600">
                    {capturedPhotos.length} photos captured and ready to process.
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center bg-gray-200 rounded-lg overflow-hidden relative">
                {previewImage ? (
                    <img
                        src={previewImage}
                        alt="Panorama Preview"
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <div className="text-center p-8">
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {capturedPhotos.map((photo, index) => (
                                <div key={photo.id} className="w-16 h-16 rounded overflow-hidden border border-gray-300">
                                    <img src={photo.data} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-600 mb-4">Click "Process Photos" to create your panorama</p>
                    </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
                        <div className="mb-4">Processing photos... {processingProgress}%</div>
                        <div className="w-64 bg-gray-700 rounded-full h-3">
                            <div
                                className="h-3 rounded-full bg-blue-500"
                                style={{ width: `${processingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-4 flex flex-col space-y-4">
                {previewImage && (
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="panorama-name" className="text-sm font-medium text-gray-700">
                            Panorama Name
                        </label>
                        <input
                            id="panorama-name"
                            type="text"
                            value={panoramaName}
                            onChange={(e) => setPanoramaName(e.target.value)}
                            placeholder="My Awesome Panorama"
                            className="border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                )}

                <div className="flex justify-between">
                    <button
                        onClick={() => resetCapture()}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Retake Photos
                    </button>

                    {previewImage ? (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Save Panorama
                        </button>
                    ) : (
                        <button
                            onClick={processPhotos}
                            disabled={isProcessing || capturedPhotos.length < 3}
                            className={`px-4 py-2 rounded-md ${isProcessing || capturedPhotos.length < 3
                                    ? 'bg-blue-300 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            Process Photos
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PhotoStitcher;