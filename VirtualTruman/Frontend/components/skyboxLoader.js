import { skyboxConfigs } from './constants.js';
import { createFadeEffect, fadeOut } from './utils.js';

export class SkyboxLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new THREE.CubeTextureLoader();
    this.currentTexture = null;
  }

  // Load skybox with improved error handling
  loadSkybox(config, onLoad, onError) {
    console.log('Loading skybox:', config.name, 'with images:', config.images);
    return this.loader.load(config.images, onLoad, undefined, onError);
  }

  // Load initial skybox
  loadInitialSkybox(skyboxIndex, onSuccess, onError) {
    const config = skyboxConfigs[skyboxIndex];
    this.currentTexture = this.loadSkybox(
      config,
      (texture) => {
        console.log('Successfully loaded initial skybox:', config.name);
        this.scene.background = texture;
        this.currentTexture = texture;
        if (onSuccess) onSuccess(texture);
      },
      (error) => {
        console.error('Failed to load initial skybox:', config.name, error);
        // Fallback to a simple color background
        this.scene.background = new THREE.Color(0x87CEEB);
        if (onError) onError(error);
      }
    );
  }

  // Transition to a new skybox with fade effect
  transitionToSkybox(skyboxIndex, onComplete, onError) {
    if (skyboxIndex < 0 || skyboxIndex >= skyboxConfigs.length) {
      console.error('Invalid skybox index:', skyboxIndex);
      if (onError) onError(new Error('Invalid skybox index'));
      return;
    }

    const newConfig = skyboxConfigs[skyboxIndex];
    console.log(`Transitioning to skybox ${skyboxIndex}: ${newConfig.name}`);

    // Create fade effect
    const { fadeMesh, fadeMaterial } = createFadeEffect(this.scene, (fadeMesh, fadeMaterial) => {
      // Load new skybox with error handling
      try {
        this.loadSkybox(
          newConfig,
          (newTexture) => {
            console.log(`Successfully loaded skybox: ${newConfig.name}`);
            this.scene.background = newTexture;
            this.currentTexture = newTexture;
            
            // Fade back in
            fadeOut(fadeMaterial, fadeMesh, this.scene, () => {
              console.log(`Transition completed to: ${newConfig.name}`);
              if (onComplete) onComplete(newTexture);
            });
          },
          (error) => {
            console.error(`Failed to load skybox: ${newConfig.name}`, error);
            this.scene.remove(fadeMesh);
            if (onError) onError(error);
          }
        );
      } catch (error) {
        console.error(`Error loading skybox: ${newConfig.name}`, error);
        this.scene.remove(fadeMesh);
        if (onError) onError(error);
      }
    });
  }

  // Get current texture
  getCurrentTexture() {
    return this.currentTexture;
  }

  // Dispose of resources
  dispose() {
    if (this.currentTexture) {
      this.currentTexture.dispose();
      this.currentTexture = null;
    }
  }
}
