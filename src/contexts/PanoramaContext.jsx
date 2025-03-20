import React, { createContext, useState, useContext } from 'react';

const PanoramaContext = createContext(null);

export const PanoramaProvider = ({ children }) => {
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [captureProgress, setCaptureProgress] = useState({
        totalNeeded: 12,
        completed: 0,
        currentDirection: 'front'
    });

    const addCapturedPhoto = (photo) => {
        setCapturedPhotos([...capturedPhotos, photo]);

        // Update progress
        const newCompleted = captureProgress.completed + 1;
        let newDirection = captureProgress.currentDirection;

        // Simple direction guidance logic
        if (newCompleted <= 3) {
            newDirection = 'right';
        } else if (newCompleted <= 6) {
            newDirection = 'back';
        } else if (newCompleted <= 9) {
            newDirection = 'left';
        } else {
            newDirection = 'up';
        }

        setCaptureProgress({
            ...captureProgress,
            completed: newCompleted,
            currentDirection: newDirection
        });
    };

    const resetCapture = () => {
        setCapturedPhotos([]);
        setCaptureProgress({
            totalNeeded: 12,
            completed: 0,
            currentDirection: 'front'
        });
    };

    return (
        <PanoramaContext.Provider value={{
            capturedPhotos,
            captureProgress,
            addCapturedPhoto,
            resetCapture
        }}>
            {children}
        </PanoramaContext.Provider>
    );
};

export const usePanorama = () => {
    const context = useContext(PanoramaContext);
    if (!context) {
        throw new Error('usePanorama must be used within a PanoramaProvider');
    }
    return context;
};