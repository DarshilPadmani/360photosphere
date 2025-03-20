import React, { useState } from 'react';
import PhotoSphere from './contexts/PhotoSphere';
import CameraCapture from './contexts/CameraCapture';
import PhotoStitcher from './contexts/PhotoStitcher';
import Navbar from './contexts/Navbar';
import { PanoramaProvider } from './contexts/PanoramaContext';

function App() {
  const [activeTab, setActiveTab] = useState('capture'); // 'capture', 'stitch', 'view'
  const [currentPanorama, setCurrentPanorama] = useState(null);
  const [savedPanoramas, setSavedPanoramas] = useState([
    { id: 1, name: 'Sample Beach', url: 'https://source.unsplash.com/1600x900/?beach-360' },
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePanoramaSave = (panorama) => {
    const newPanorama = {
      id: savedPanoramas.length + 1,
      name: panorama.name || `Panorama ${savedPanoramas.length + 1}`,
      url: panorama.url,
      createdAt: new Date().toISOString()
    };

    setSavedPanoramas([...savedPanoramas, newPanorama]);
    setCurrentPanorama(newPanorama);
    setActiveTab('view');
  };

  const selectPanorama = (panorama) => {
    setCurrentPanorama(panorama);
    setActiveTab('view');
  };

  return (
    <PanoramaProvider>
      <div className="flex flex-col h-screen bg-gray-100">
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex-1 overflow-hidden">
          {activeTab === 'capture' && (
            <CameraCapture onComplete={() => setActiveTab('stitch')} />
          )}

          {activeTab === 'stitch' && (
            <PhotoStitcher onSavePanorama={handlePanoramaSave} />
          )}

          {activeTab === 'view' && (
            <div className="flex h-full">
              <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Your Panoramas</h3>
                <ul className="space-y-2">
                  {savedPanoramas.map((panorama) => (
                    <li
                      key={panorama.id}
                      className={`cursor-pointer p-2 rounded ${currentPanorama && currentPanorama.id === panorama.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => selectPanorama(panorama)}
                    >
                      <div className="text-sm font-medium text-gray-700">{panorama.name}</div>
                      <div className="text-xs text-gray-500">
                        {panorama.createdAt ? new Date(panorama.createdAt).toLocaleDateString() : 'Sample'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 relative">
                {currentPanorama ? (
                  <PhotoSphere imageUrl={currentPanorama.url} />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p>Select a panorama from the sidebar to view</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PanoramaProvider>
  );
}

export default App;