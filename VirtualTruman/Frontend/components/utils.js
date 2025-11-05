import { cameraSettings, animationSettings } from './constants.js';

// Easing function for smooth animations
export const easeInOut = (progress) => {
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
};

// WebGL detection and error handling
export const checkWebGLSupport = () => {
  if (!window.WebGLRenderingContext) {
    console.error('WebGL not supported');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 10000;"><h2>WebGL Not Supported</h2><p>Your browser does not support WebGL. Please use a modern browser.</p></div>';
    document.body.appendChild(errorDiv);
    return false;
  }
  return true;
};

// Show error message for 3D scene initialization
export const showSceneError = (error) => {
  console.error('Error initializing Three.js scene:', error);
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 10000;"><h2>3D Scene Error</h2><p>Failed to initialize 3D environment. Please refresh the page.</p></div>';
  document.body.appendChild(errorDiv);
};

// Hide global loading indicator
export const hideLoadingIndicator = () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};

// Create fade effect for skybox transitions
export const createFadeEffect = (scene, onComplete) => {
  const fadeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0
  });
  const fadeGeometry = new THREE.PlaneGeometry(2, 2);
  const fadeMesh = new THREE.Mesh(fadeGeometry, fadeMaterial);
  scene.add(fadeMesh);
  
  const fadeIn = () => {
    const fadeInterval = setInterval(() => {
      fadeMaterial.opacity += animationSettings.fadeOpacityStep;
      if (fadeMaterial.opacity >= 1) {
        clearInterval(fadeInterval);
        onComplete(fadeMesh, fadeMaterial);
      }
    }, animationSettings.fadeTransitionInterval);
  };
  
  setTimeout(fadeIn, 50);
  return { fadeMesh, fadeMaterial };
};

// Fade out effect
export const fadeOut = (fadeMaterial, fadeMesh, scene, onComplete) => {
  const fadeOutInterval = setInterval(() => {
    fadeMaterial.opacity -= animationSettings.fadeOpacityStep;
    if (fadeMaterial.opacity <= 0) {
      clearInterval(fadeOutInterval);
      scene.remove(fadeMesh);
      if (onComplete) onComplete();
    }
  }, animationSettings.fadeTransitionInterval);
};

// Create annotation marker texture
export const createAnnotationTexture = () => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const radius = 10;
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  
  return new THREE.CanvasTexture(canvas);
};

// Calculate mouse position for raycasting
export const calculateMousePosition = (event, renderer) => {
  const rect = renderer.domElement.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((event.clientY - rect.top) / rect.height) * 2 + 1
  };
};

// Animate camera to annotation
export const animateCameraToAnnotation = (camera, controls, annotation, onComplete) => {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startFOV = camera.fov;
  
  const endPosition = annotation.cameraPosition;
  const endTarget = annotation.cameraTarget;
  const endFOV = annotation.fov;
  
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / animationSettings.cameraTransitionDuration, 1);
    const eased = easeInOut(progress);
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, endPosition, eased);
    
    // Interpolate camera target
    controls.target.lerpVectors(startTarget, endTarget, eased);
    
    // Interpolate FOV
    camera.fov = startFOV + (endFOV - startFOV) * eased;
    camera.updateProjectionMatrix();
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  }
  
  animate();
};

// Animate camera back to overview
export const animateCameraToOverview = (camera, controls, onComplete) => {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startFOV = camera.fov;
  
  const endPosition = new THREE.Vector3(
    cameraSettings.position.x, 
    cameraSettings.position.y, 
    cameraSettings.position.z
  );
  const endTarget = new THREE.Vector3(
    cameraSettings.target.x, 
    cameraSettings.target.y, 
    cameraSettings.target.z
  );
  const endFOV = cameraSettings.fov;
  
  const startTime = Date.now();
  
  function animateReturn() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / animationSettings.cameraTransitionDuration, 1);
    const eased = easeInOut(progress);
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, endPosition, eased);
    
    // Interpolate camera target
    controls.target.lerpVectors(startTarget, endTarget, eased);
    
    // Interpolate FOV
    camera.fov = startFOV + (endFOV - startFOV) * eased;
    camera.updateProjectionMatrix();
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateReturn);
    } else if (onComplete) {
      onComplete();
    }
  }
  
  animateReturn();
};

// Click bounce animation for annotations
export const animateClickBounce = (sprite, originalScale = 2) => {
  const startTime = Date.now();
  const duration = animationSettings.clickBounceDuration;
  
  const animateClick = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const bounce = Math.sin(progress * Math.PI);
    const scale = originalScale + bounce * 10;
    sprite.scale.set(scale, scale, 1);
    if (progress < 1) {
      requestAnimationFrame(animateClick);
    } else {
      sprite.scale.set(originalScale, originalScale, 1);
    }
  };
  requestAnimationFrame(animateClick);
};
