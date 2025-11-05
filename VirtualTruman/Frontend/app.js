// Main App Component
function App() {
  const [currentSkybox, setCurrentSkybox] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  // Navigation handlers
  const handlePrevious = () => {
    if (isTransitioning) return;
    const newIndex = currentSkybox > 0 ? currentSkybox - 1 : 1; // Loop to last if at first
    setCurrentSkybox(newIndex);
    if (window.transitionToSkybox) {
      window.transitionToSkybox(newIndex);
    }
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const newIndex = currentSkybox < 1 ? currentSkybox + 1 : 0; // Loop to first if at last
    setCurrentSkybox(newIndex);
    if (window.transitionToSkybox) {
      window.transitionToSkybox(newIndex);
    }
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <SkyboxScene />
      
      {/* UI Components */}
      <BackButton />
      <TrumanBranding />
      <MainTitle />
      <NavigationInstructions />
      
      {/* Skybox Navigation Controls */}
      <SkyboxNavigationControls
        currentSkybox={currentSkybox}
        isTransitioning={isTransitioning}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      
      {/* Loading Indicator */}
      <LoadingIndicator isTransitioning={isTransitioning} />
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);