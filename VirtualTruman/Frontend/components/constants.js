// Skybox configurations
export const skyboxConfigs = [
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

// Annotation configurations - using plain objects that will be converted to Vector3 later
export const annotations = [
  {
    position: { x: 0, y: 0, z: -50 }, // Front face (stuck to cube interior)
    title: "Front Annotation",
    visible: true,
    cameraTarget: { x: 0, y: 0, z: -50 },
    cameraPosition: { x: 0, y: 0, z: -20 },
    fov: 60
  },
  {
    position: { x: 0, y: 0, z: 50 }, // Back face (stuck to cube interior)
    title: "Back Annotation",
    visible: true,
    cameraTarget: { x: 0, y: 0, z: 50 },
    cameraPosition: { x: 0, y: 0, z: 20 },
    fov: 60
  },
  {
    position: { x: -50, y: 0, z: 0 }, // Left face (stuck to cube interior)
    title: "Left Annotation",
    visible: true,
    cameraTarget: { x: -50, y: 0, z: 0 },
    cameraPosition: { x: -20, y: 0, z: 0 },
    fov: 60
  },
  {
    position: { x: 50, y: 0, z: 0 }, // Right face (stuck to cube interior)
    title: "Right Annotation",
    visible: true,
    cameraTarget: { x: 50, y: 0, z: 0 },
    cameraPosition: { x: 20, y: 0, z: 0 },
    fov: 60
  },
  {
    position: { x: 0, y: 50, z: 0 }, // Top face (stuck to cube interior)
    title: "Top Annotation",
    visible: true,
    cameraTarget: { x: 0, y: 50, z: 0 },
    cameraPosition: { x: 0, y: 20, z: 0 },
    fov: 60
  },
  {
    position: { x: 0, y: -50, z: 0 }, // Bottom face (stuck to cube interior)
    title: "Bottom Annotation",
    visible: true,
    cameraTarget: { x: 0, y: -50, z: 0 },
    cameraPosition: { x: 0, y: -20, z: 0 },
    fov: 60
  }
];

// Camera settings
export const cameraSettings = {
  fov: 75,
  near: 0.1,
  far: 1000,
  position: { x: 0, y: 0, z: 5 },
  target: { x: 0, y: 0, z: 0 }
};

// Animation settings
export const animationSettings = {
  cameraTransitionDuration: 1500,
  clickBounceDuration: 500,
  fadeTransitionInterval: 30,
  fadeOpacityStep: 0.08
};
