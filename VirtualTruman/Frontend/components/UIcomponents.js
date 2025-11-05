// Back Button Component
function BackButton() {
  return (
    <div className="absolute top-4 left-4 z-20">
      <button 
        onClick={() => window.location.href = 'welcome.html'}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Welcome
      </button>
    </div>
  );
}

// Skybox Navigation Controls Component
function SkyboxNavigationControls({ currentSkybox, isTransitioning, onPrevious, onNext }) {
  const skyboxConfigs = [
    { name: "Truman Campus" },
    { name: "Football Field" }
  ];

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-black bg-opacity-70 rounded-lg p-4 flex items-center space-x-4">
        {/* Previous Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Previous button onClick triggered');
            onPrevious();
          }}
          disabled={isTransitioning}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
          style={{ cursor: isTransitioning ? 'not-allowed' : 'pointer' }}
        >
          <i className="fas fa-step-backward text-lg"></i>
        </button>
        
        {/* Current Skybox Info */}
        <div className="text-white text-center min-w-[120px]">
          <p className="text-sm font-semibold">{skyboxConfigs[currentSkybox]?.name}</p>
          <p className="text-xs text-gray-300">
            {currentSkybox + 1} of {skyboxConfigs.length}
          </p>
        </div>
        
        {/* Next Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Next button onClick triggered');
            onNext();
          }}
          disabled={isTransitioning}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
          style={{ cursor: isTransitioning ? 'not-allowed' : 'pointer' }}
        >
          <i className="fas fa-step-forward text-lg"></i>
        </button>
      </div>
    </div>
  );
}

// Navigation Instructions Component
function NavigationInstructions() {
  return (
    <div className="absolute bottom-4 left-4 bg-purple-800 bg-opacity-80 p-4 rounded-lg text-white">
      <p className="text-sm font-semibold">🖱️ Mouse Controls:</p>
      <p className="text-xs mt-1">• Click & drag to look around</p>
      <p className="text-xs">• Scroll to zoom in/out</p>
      <p className="text-xs">• Right-click & drag to pan</p>
    </div>
  );
}

// Truman Branding Component
function TrumanBranding() {
  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
        <img src="../public/logo/logo.svg" alt="Truman State University" className="h-8 w-auto" />
      </div>
    </div>
  );
}

// Loading Indicator Component
function LoadingIndicator({ isTransitioning }) {
  if (!isTransitioning) return null;
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white bg-opacity-90 p-6 rounded-lg text-center">
        <div className="pixelated-rotate mb-4"></div>
        <p className="text-purple-600 font-semibold">Loading Skybox...</p>
      </div>
    </div>
  );
}

// Main Title Component
function MainTitle() {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Truman Virtual Tour</h1>
    </div>
  );
}