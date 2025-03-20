import React, { useRef, useState, useEffect } from 'react';
import { usePanorama } from './PanoramaContext';

function CameraCapture({ onComplete }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(false);
    const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
    const { capturedPhotos, captureProgress, addCapturedPhoto, resetCapture } = usePanorama();

    useEffect(() => {
        startCamera();

        // Listen for device orientation
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            stopCamera();
            if (window.DeviceOrientationEvent) {
                window.removeEventListener('deviceorientation', handleOrientation);
            }
        };
    }, [isFrontCamera]);

    const handleOrientation = (event) => {
        setOrientation({
            alpha: event.alpha, // Rotation around z-axis (0-360)
            beta: event.beta,   // Rotation around x-axis (-180-180)
            gamma: event.gamma  // Rotation around y-axis (-90-90)
        });
    };

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: isFrontCamera ? 'user' : 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraReady(true);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraReady(false);
        }
    };

    const switchCamera = () => {
        stopCamera();
        setIsFrontCamera(!isFrontCamera);
    };

    const capturePhoto = () => {
        if (!isCameraReady) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const photoData = canvas.toDataURL('image/jpeg');

        // Add to captured photos with orientation data
        addCapturedPhoto({
            id: Date.now(),
            data: photoData,
            orientation: { ...orientation }
        });
    };

    const handleReset = () => {
        resetCapture();
    };

    const handleComplete = () => {
        onComplete();
    };

    const renderCaptureGuide = () => {
        const { completed, totalNeeded, currentDirection } = captureProgress;
        const progress = Math.round((completed / totalNeeded) * 100);

        let directionText = '';
        switch (currentDirection) {
            case 'front':
                directionText = 'straight ahead';
                break;
            case 'right':
                directionText = 'to the right';
                break;
            case 'back':
                directionText = 'behind you';
                break;
            case 'left':
                directionText = 'to the left';
                break;
            case 'up':
                directionText = 'above you';
                break;
            default:
                directionText = 'around you';
        }

        return (
            <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center sm:bottom-16 md:bottom-12">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg mb-2 text-sm sm:text-xs md:text-base">
                    <p className="text-center">Point your camera {directionText}</p>
                </div>
                <div className="w-64 bg-gray-300 rounded-full h-3 sm:w-48 md:w-56">
                    <div
                        className="h-3 rounded-full bg-blue-600"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="mt-2 text-white text-sm sm:text-xs md:text-base">
                    {completed} of {totalNeeded} photos
                </div>
            </div>
        );
    };

    const renderOrientation = () => {
        return (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-xs sm:text-xxs md:text-sm">
                <div>α: {Math.round(orientation.alpha)}°</div>
                <div>β: {Math.round(orientation.beta)}°</div>
                <div>γ: {Math.round(orientation.gamma)}°</div>
            </div>
        );
    };

    return (
        <div className="relative h-full sm:h-screen md:h-auto">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover sm:h-3/4 md:h-2/3"
            />
            <canvas ref={canvasRef} className="hidden" />

            {renderOrientation()}
            {renderCaptureGuide()}

            <div className="absolute bottom-4 w-full flex justify-center space-x-4 sm:space-x-2 md:space-x-3">
                <button
                    onClick={handleReset}
                    className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg sm:w-10 sm:h-10 md:w-11 md:h-11"
                >
                    ...
                </button>

                <button
                    onClick={capturePhoto}
                    className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-blue-500 sm:w-14 sm:h-14 md:w-15 md:h-15"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500 sm:w-10 sm:h-10 md:w-11 md:h-11"></div>
                </button>

                <button
                    onClick={switchCamera}
                    className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg sm:w-10 sm:h-10 md:w-11 md:h-11"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                </button>
            </div>

            {capturedPhotos.length >= 6 && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={handleComplete}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md sm:px-3 sm:py-1 md:px-3.5 md:py-1.5"
                    >
                        Done ({capturedPhotos.length})
                    </button>
                </div>
            )}

            <div className="absolute bottom-24 right-4 bg-black bg-opacity-50 rounded p-2 sm:bottom-20 md:bottom-16">
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-2 md:grid-cols-3">
                    {capturedPhotos.slice(-6).map((photo, i) => (
                        <div key={photo.id} className="w-12 h-12 rounded overflow-hidden sm:w-10 sm:h-10 md:w-11 md:h-11">
                            <img src={photo.data} alt={`Capture ${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CameraCapture;