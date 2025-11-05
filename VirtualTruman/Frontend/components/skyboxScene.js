// Skybox Component with Multi-Skybox Support
function SkyboxScene() {
  const mountRef = React.useRef(null);
  const [currentSkybox, setCurrentSkybox] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Skybox configurations
  const skyboxConfigs = [
    {
      name: "Truman Campus",
      images: [
        "../public/images/posx.jpg", "../public/images/negx.jpg",
        "../public/images/posy.jpg", "../public/images/negy.jpg",
        "../public/images/posz.jpg", "../public/images/negz.jpg"
      ]
    },
    {
      name: "Football Field",
      images: [
        "../public/field-skyboxes 2/Footballfield2/posx.jpg", "../public/field-skyboxes 2/Footballfield2/negx.jpg",
        "../public/field-skyboxes 2/Footballfield2/posy.jpg", "../public/field-skyboxes 2/Footballfield2/negy.jpg",
        "../public/field-skyboxes 2/Footballfield2/posz.jpg", "../public/field-skyboxes 2/Footballfield2/negz.jpg"
      ]
    }
  ];

  React.useEffect(() => {
    // WebGL Detection and Error Handling
    if (!window.WebGLRenderingContext) {
      console.error('WebGL not supported');
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 10000;"><h2>WebGL Not Supported</h2><p>Your browser does not support WebGL. Please use a modern browser.</p></div>';
      document.body.appendChild(errorDiv);
      return;
    }

    try {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Hide global loading indicator if present
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }

      // Orbit controls
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;

      // Load initial skybox with improved error handling
      const loader = new THREE.CubeTextureLoader();
      const loadSkybox = (config, onLoad, onError) => {
        console.log('Loading skybox:', config.name, 'with images:', config.images);
        return loader.load(config.images, onLoad, undefined, onError);
      };
      
      let currentTexture = loadSkybox(
        skyboxConfigs[currentSkybox],
        (texture) => {
          console.log('Successfully loaded initial skybox:', skyboxConfigs[currentSkybox].name);
          scene.background = texture;
          currentTexture = texture;
        },
        (error) => {
          console.error('Failed to load initial skybox:', skyboxConfigs[currentSkybox].name, error);
          // Fallback to a simple color background
          scene.background = new THREE.Color(0x87CEEB);
        }
      );

      // Basic lighting
      const light = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(light);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      // Camera position
      camera.position.z = 5;
      
      // ---------------- Annotation System ----------------
      let annotationSprites = [];
      let raycaster;
      let mouse;
      let isHovering = false;
      let hoveredAnnotation = null;
      
      const annotations = [
        {
          position: new THREE.Vector3(0, 0, -50), // Front face (stuck to cube interior)
          title: "Front Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, 0, -50),
          cameraPosition: new THREE.Vector3(0, 0, -20),
          fov: 60
        },
        {
          position: new THREE.Vector3(0, 0, 50), // Back face (stuck to cube interior)
          title: "Back Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, 0, 50),
          cameraPosition: new THREE.Vector3(0, 0, 20),
          fov: 60
        },
        {
          position: new THREE.Vector3(-50, 0, 0), // Left face (stuck to cube interior)
          title: "Left Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(-50, 0, 0),
          cameraPosition: new THREE.Vector3(-20, 0, 0),
          fov: 60
        },
        {
          position: new THREE.Vector3(50, 0, 0), // Right face (stuck to cube interior)
          title: "Right Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(50, 0, 0),
          cameraPosition: new THREE.Vector3(20, 0, 0),
          fov: 60
        },
        {
          position: new THREE.Vector3(0, 50, 0), // Top face (stuck to cube interior)
          title: "Top Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, 50, 0),
          cameraPosition: new THREE.Vector3(0, 20, 0),
          fov: 60
        },
        {
          position: new THREE.Vector3(0, -50, 0), // Bottom face (stuck to cube interior)
          title: "Bottom Annotation",
          visible: true,
          cameraTarget: new THREE.Vector3(0, -50, 0),
          cameraPosition: new THREE.Vector3(0, -20, 0),
          fov: 60
        }
      ];

      // Create annotation markers
      const createAnnotationTexture = () => {
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

      const texture = createAnnotationTexture();
      
      // Create sprites for each annotation
      annotations.forEach((annotation, index) => {
        const material = new THREE.SpriteMaterial({ 
          map: texture, 
          transparent: true, 
          depthTest: false,
          depthWrite: false,
          alphaTest: 0.1
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(annotation.position);
        sprite.scale.set(2, 2, 1); // Small as a pea
        sprite.renderOrder = 999; // Render on top
        sprite.userData = { annotationIndex: index, annotation: annotation };
        scene.add(sprite);
        annotationSprites.push(sprite);
      });

      // Mouse interaction setup
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Handle mouse move for raycasting
      const onMouseMove = (event) => {
        if (!raycaster || !mouse || annotationSprites.length === 0) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(annotationSprites, true);
        
        if (intersects.length > 0) {
          const intersectedSprite = intersects[0].object;
          if (hoveredAnnotation !== intersectedSprite) {
            // Reset previous hovered annotation
            if (hoveredAnnotation) {
              hoveredAnnotation.scale.set(2, 2, 1);
              renderer.domElement.style.cursor = 'default';
            }
            // Set new hovered annotation
            intersectedSprite.scale.set(3, 3, 1);
            renderer.domElement.style.cursor = 'pointer';
            hoveredAnnotation = intersectedSprite;
            isHovering = true;
          }
        } else if (hoveredAnnotation) {
          // No intersection, reset hover
          hoveredAnnotation.scale.set(2, 2, 1);
          renderer.domElement.style.cursor = 'default';
          hoveredAnnotation = null;
          isHovering = false;
        }
      };

      // Handle mouse click
      const onMouseClick = () => {
        if (isHovering && hoveredAnnotation) {
          // Animate camera to annotation
          const annotation = hoveredAnnotation.userData.annotation;
          const startPosition = camera.position.clone();
          const startTarget = controls.target.clone();
          const startFOV = camera.fov;
          
          const endPosition = annotation.cameraPosition;
          const endTarget = annotation.cameraTarget;
          const endFOV = annotation.fov;
          
          const startTime = Date.now();
          const duration = 1500; // 1.5 seconds
          
          const easeInOut = (progress) => {
            return progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          };
          
          function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
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
            } else {
              // Show annotation details
              showAnnotationDetails(annotation);
            }
          }
          
          animate();
          
          // Simple click bounce animation
          const startTime2 = Date.now();
          const bounceDuration = 500;
          const animateClick = () => {
            const elapsed = Date.now() - startTime2;
            const progress = Math.min(elapsed / bounceDuration, 1);
            const bounce = Math.sin(progress * Math.PI);
            const scale = 2 + bounce * 10;
            hoveredAnnotation.scale.set(scale, scale, 1);
            if (progress < 1) {
              requestAnimationFrame(animateClick);
            } else {
              hoveredAnnotation.scale.set(2, 2, 1);
            }
          };
          requestAnimationFrame(animateClick);
        }
      };

      // Show annotation details with return button
      const showAnnotationDetails = (annotation) => {
        // Remove existing detail panel
        const existingPanel = document.getElementById('annotationDetailPanel');
        if (existingPanel) {
          existingPanel.remove();
        }
        
        // Create detail panel
        const panel = document.createElement('div');
        panel.id = 'annotationDetailPanel';
        panel.innerHTML = `
          <div class="annotation-detail-content">
            <h2>${annotation.title}</h2>
            <p>You've focused on the ${annotation.title.toLowerCase()} area of the Truman campus.</p>
            <p>This is where the smooth camera transition brings you for a closer look at specific campus features.</p>
            <button class="return-btn" onclick="returnToOverview()">🔙 Return to Overview</button>
          </div>
        `;
        document.body.appendChild(panel);
        
        // Show with animation
        setTimeout(() => panel.classList.add('show'), 10);
        
        // Add return to overview function to global scope
        window.returnToOverview = () => {
          const startPosition = camera.position.clone();
          const startTarget = controls.target.clone();
          const startFOV = camera.fov;
          
          const endPosition = new THREE.Vector3(0, 0, 5);
          const endTarget = new THREE.Vector3(0, 0, 0);
          const endFOV = 75;
          
          const startTime = Date.now();
          const duration = 1500;
          
          const easeInOut = (progress) => {
            return progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          };
          
          function animateReturn() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
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
            } else {
              // Remove detail panel
              const panel = document.getElementById('annotationDetailPanel');
              if (panel) {
                panel.remove();
              }
            }
          }
          
          animateReturn();
        };
      };

      // Add event listeners
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onMouseClick);

      // Animation loop with performance optimization
      let animationId;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();
        
        // Make annotations always face camera (billboard behavior)
        annotationSprites.forEach(sprite => {
          sprite.lookAt(camera.position);
        });
        
        // Pulse animation while hovering over annotation (throttled)
        if (hoveredAnnotation && isHovering) {
          const scale = 2 + Math.sin(Date.now() * 0.005) * 0.5;
          hoveredAnnotation.scale.set(scale, scale, 1);
        }
        
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      // Expose transition function globally
      window.transitionToSkybox = (skyboxIndex) => {
        if (isTransitioning || skyboxIndex === currentSkybox) return;
        
        console.log(`Transitioning to skybox ${skyboxIndex}`);
        setIsTransitioning(true);
        
        // Create fade effect
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
            fadeMaterial.opacity += 0.08;
            if (fadeMaterial.opacity >= 1) {
              clearInterval(fadeInterval);
              // Load new skybox
              const newConfig = skyboxConfigs[skyboxIndex];
              loadSkybox(
                newConfig,
                (newTexture) => {
                  console.log(`Successfully loaded skybox: ${newConfig.name}`);
                  scene.background = newTexture;
                  currentTexture = newTexture;
                  
                  // Fade back out
                  const fadeOutInterval = setInterval(() => {
                    fadeMaterial.opacity -= 0.08;
                    if (fadeMaterial.opacity <= 0) {
                      clearInterval(fadeOutInterval);
                      scene.remove(fadeMesh);
                      console.log(`Transition completed to: ${newConfig.name}`);
                      setIsTransitioning(false);
                    }
                  }, 30);
                },
                (error) => {
                  console.error(`Failed to load skybox: ${newConfig.name}`, error);
                  scene.remove(fadeMesh);
                  setIsTransitioning(false);
                }
              );
            }
          }, 30);
        };
        
        setTimeout(fadeIn, 50);
      };
      
      window.getCurrentSkybox = () => currentSkybox;
      window.getSkyboxConfigs = () => skyboxConfigs;

      // Cleanup with proper resource disposal
      return () => {
        // Cancel animation loop
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        // Remove event listeners
        window.removeEventListener("resize", handleResize);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onMouseClick);
        
        // Dispose of annotation sprites
        annotationSprites.forEach(sprite => {
          if (sprite && sprite.material) {
            sprite.material.map?.dispose();
            sprite.material.dispose();
          }
        });
        
        // Remove sprites from scene
        annotationSprites.forEach(sprite => {
          scene.remove(sprite);
        });
        
        // Dispose of Three.js resources
        if (renderer) {
          renderer.dispose();
        }
        
        // Remove renderer from DOM
        if (mountRef.current && renderer && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    } catch (error) {
      console.error('Error initializing Three.js scene:', error);
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,0,0,0.9); color: white; padding: 20px; border-radius: 10px; text-align: center; z-index: 10000;"><h2>3D Scene Error</h2><p>Failed to initialize 3D environment. Please refresh the page.</p></div>';
      document.body.appendChild(errorDiv);
    }
  }, [currentSkybox, isTransitioning]);

  return <div ref={mountRef} className="absolute inset-0" />;
}