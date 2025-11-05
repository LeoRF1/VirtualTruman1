import { annotations } from './constants.js';
import { 
  createAnnotationTexture, 
  calculateMousePosition, 
  animateCameraToAnnotation, 
  animateCameraToOverview,
  animateClickBounce 
} from './utils.js';

export class AnnotationManager {
  constructor(scene, camera, controls, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.renderer = renderer;
    this.annotationSprites = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isHovering = false;
    this.hoveredAnnotation = null;
    this.annotations = annotations;
    
    this.setupEventListeners();
    this.createAnnotationMarkers();
  }

  // Create annotation markers
  createAnnotationMarkers() {
    const texture = createAnnotationTexture();
    
    // Create sprites for each annotation
    this.annotations.forEach((annotation, index) => {
      const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true, 
        depthTest: false,
        depthWrite: false,
        alphaTest: 0.1
      });
      const sprite = new THREE.Sprite(material);
      
      // Convert plain object to Vector3
      const position = new THREE.Vector3(annotation.position.x, annotation.position.y, annotation.position.z);
      sprite.position.copy(position);
      sprite.scale.set(2, 2, 1); // Small as a pea
      sprite.renderOrder = 999; // Render on top
      
      // Convert annotation data to use Vector3 objects
      const processedAnnotation = {
        ...annotation,
        position: position,
        cameraTarget: new THREE.Vector3(annotation.cameraTarget.x, annotation.cameraTarget.y, annotation.cameraTarget.z),
        cameraPosition: new THREE.Vector3(annotation.cameraPosition.x, annotation.cameraPosition.y, annotation.cameraPosition.z)
      };
      
      sprite.userData = { annotationIndex: index, annotation: processedAnnotation };
      this.scene.add(sprite);
      this.annotationSprites.push(sprite);
    });
  }

  // Handle annotation hover
  onAnnotationHover(sprite, hovering) {
    if (!sprite) return;
    this.isHovering = hovering;
    if (hovering) {
      sprite.scale.set(3, 3, 1); // Slightly larger on hover
      this.renderer.domElement.style.cursor = 'pointer';
      this.hoveredAnnotation = sprite;
    } else {
      sprite.scale.set(2, 2, 1); // Match the new base scale
      this.renderer.domElement.style.cursor = 'default';
      this.hoveredAnnotation = null;
    }
  }

  // Handle annotation click
  onAnnotationClick(sprite) {
    // Animate camera to annotation
    animateCameraToAnnotation(
      this.camera, 
      this.controls, 
      sprite.userData.annotation,
      () => this.showAnnotationDetails(sprite.userData.annotation)
    );
    
    // Simple click bounce animation
    animateClickBounce(sprite, 2);
  }

  // Show annotation details with return button
  showAnnotationDetails(annotation) {
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
      animateCameraToOverview(this.camera, this.controls, () => {
        // Remove detail panel
        const panel = document.getElementById('annotationDetailPanel');
        if (panel) {
          panel.remove();
        }
      });
    };
  }

  // Handle mouse move for raycasting
  onMouseMove(event) {
    if (!this.raycaster || !this.mouse || this.annotationSprites.length === 0) return;
    
    const mousePos = calculateMousePosition(event, this.renderer);
    this.mouse.x = mousePos.x;
    this.mouse.y = mousePos.y;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.annotationSprites, true);
    
    if (intersects.length > 0) {
      const intersectedSprite = intersects[0].object;
      if (this.hoveredAnnotation !== intersectedSprite) {
        // Reset previous hovered annotation
        if (this.hoveredAnnotation) {
          this.onAnnotationHover(this.hoveredAnnotation, false);
        }
        // Set new hovered annotation
        this.onAnnotationHover(intersectedSprite, true);
      }
    } else if (this.hoveredAnnotation) {
      // No intersection, reset hover
      this.onAnnotationHover(this.hoveredAnnotation, false);
    }
  }

  // Handle mouse click
  onMouseClick() {
    if (this.isHovering && this.hoveredAnnotation) {
      this.onAnnotationClick(this.hoveredAnnotation);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
    this.renderer.domElement.addEventListener('click', () => this.onMouseClick());
  }

  // Update annotations (called in animation loop)
  update() {
    // Make annotations always face camera (billboard behavior)
    this.annotationSprites.forEach(sprite => {
      sprite.lookAt(this.camera.position);
    });
    
    // Pulse animation while hovering over annotation (throttled)
    if (this.hoveredAnnotation && this.isHovering) {
      const scale = 2 + Math.sin(Date.now() * 0.005) * 0.5; // Match new base scale with subtle pulse
      this.hoveredAnnotation.scale.set(scale, scale, 1);
    }
  }

  // Cleanup resources
  dispose() {
    // Remove event listeners
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
      this.renderer.domElement.removeEventListener('click', this.onMouseClick);
    }
    
    // Dispose of annotation sprites
    this.annotationSprites.forEach(sprite => {
      if (sprite && sprite.material) {
        sprite.material.map?.dispose();
        sprite.material.dispose();
      }
    });
    
    // Remove sprites from scene
    this.annotationSprites.forEach(sprite => {
      this.scene.remove(sprite);
    });
    
    this.annotationSprites = [];
  }
}
