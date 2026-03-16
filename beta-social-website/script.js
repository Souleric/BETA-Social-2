// --- THREE.JS PARTICLE SETUP ---

// Settings
const config = {
  particleCount: window.innerWidth < 768 ? 150 : 350, // Mobile reduction
  maxDistance: 150, // Line connection threshold
  baseSpeed: 0.2, // Base floating speed
  interactionRadius: 200, // Mouse interaction area
  repelForce: 2.0 // How much particles are pushed away
};

let scene, camera, renderer;
let particlesData = [];
let particlePositions;
let pointCloud;
let linesMesh;

let mouseX = 0;
let mouseY = 0;
let mouseVector = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const init = () => {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x243148, 0.001);

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
  camera.position.z = 1000;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize for high DPI but limit to 2x for perf
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  // Particles Geometry
  const pGeometry = new THREE.BufferGeometry();
  particlePositions = new Float32Array(config.particleCount * 3);
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  // Initialize particles
  for (let i = 0; i < config.particleCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 1000; // Create depth layers

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particlesData.push({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * config.baseSpeed,
        (Math.random() - 0.5) * config.baseSpeed,
        (Math.random() - 0.5) * config.baseSpeed
      ),
      numConnections: 0,
      baseDist: z // Original depth
    });
  }

  pGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  pointCloud = new THREE.Points(pGeometry, particleMaterial);
  scene.add(pointCloud);

  // Lines Geometry
  // Max possible connections: particleCount * particleCount (approx, but we pre-allocate a safe limit)
  const maxLines = config.particleCount * config.particleCount;
  const linePositions = new Float32Array(maxLines * 3);
  const lineOpacity = new Float32Array(maxLines); // Optional for custom shaders, but we use Basic material for perf

  const lGeometry = new THREE.BufferGeometry();
  lGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));

  const lMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });

  linesMesh = new THREE.LineSegments(lGeometry, lMaterial);
  scene.add(linesMesh);

  // Events
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', onMouseMove, false);
  
  // Parallax subtle interaction based on mouse
  document.addEventListener('mousemove', parallaxEffect, false);

  animate();
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Reduce particles on massive resize to mobile if needed (simplified for this demo)
};

const onMouseMove = (event) => {
  // Normalize mouse coordinates for Raycaster
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Get 3D intersection point of mouse on z=0 plane
  raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
  raycaster.ray.intersectPlane(mousePlane, mouseVector);
};

// Subtle camera tilt parallax
const parallaxEffect = (event) => {
  const normX = (event.clientX / window.innerWidth) - 0.5;
  const normY = (event.clientY / window.innerHeight) - 0.5;

  gsap.to(camera.position, {
    x: normX * 100,
    y: -normY * 100,
    duration: 1.5,
    ease: "power2.out"
  });
};

const animate = () => {
  requestAnimationFrame(animate);

  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;

  // Reset connections count
  for (let i = 0; i < config.particleCount; i++) {
    particlesData[i].numConnections = 0;
  }

  // Animate particles
  for (let i = 0; i < config.particleCount; i++) {
    const particleData = particlesData[i];

    // Current positions
    let px = particlePositions[i * 3];
    let py = particlePositions[i * 3 + 1];
    let pz = particlePositions[i * 3 + 2];

    // Simple floating movement
    px += particleData.velocity.x;
    py += particleData.velocity.y;
    pz += particleData.velocity.z;

    // Bounds check to loop particles around
    if (px < -1000 || px > 1000) particleData.velocity.x *= -1;
    if (py < -1000 || py > 1000) particleData.velocity.y *= -1;
    if (pz < -500 || pz > 500) particleData.velocity.z *= -1;

    // Mouse Interaction (repel/attract)
    const dx = mouseVector.x - px;
    const dy = mouseVector.y - py;
    const distToMouse = Math.sqrt(dx * dx + dy * dy);

    if (distToMouse < config.interactionRadius) {
      // Repel from mouse slightly
      const force = (config.interactionRadius - distToMouse) / config.interactionRadius;
      px -= (dx / distToMouse) * force * config.repelForce;
      py -= (dy / distToMouse) * force * config.repelForce;
    }

    // Assign new positions
    particlePositions[i * 3] = px;
    particlePositions[i * 3 + 1] = py;
    particlePositions[i * 3 + 2] = pz;

    // Check distances to other particles to draw lines
    for (let j = i + 1; j < config.particleCount; j++) {
      const particleDataB = particlesData[j];

      let dx2 = particlePositions[i * 3] - particlePositions[j * 3];
      let dy2 = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
      let dz2 = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);

      if (dist2 < config.maxDistance) {
        particleData.numConnections++;
        particleDataB.numConnections++;

        // Add line vertices
        linesMesh.geometry.attributes.position.array[vertexpos++] = particlePositions[i * 3];
        linesMesh.geometry.attributes.position.array[vertexpos++] = particlePositions[i * 3 + 1];
        linesMesh.geometry.attributes.position.array[vertexpos++] = particlePositions[i * 3 + 2];

        linesMesh.geometry.attributes.position.array[vertexpos++] = particlePositions[j * 3];
        linesMesh.geometry.attributes.position.array[vertexpos++] = particlePositions[j * 3 + 1];
        linesMesh.geometry.attributes.position.array[vertexpos++] = particlePositions[j * 3 + 2];

        numConnected++;
      }
    }
  }

  // Update geometry buffers
  pointCloud.geometry.attributes.position.needsUpdate = true;
  linesMesh.geometry.attributes.position.needsUpdate = true;
  
  // Set draw range so we only render active connected lines
  linesMesh.geometry.setDrawRange(0, numConnected * 2);

  // Rotate entire system very slowly for ambient effect
  scene.rotation.y += 0.0002;
  scene.rotation.x += 0.0001;

  renderer.render(scene, camera);
};

// Intro animation with GSAP
const startIntroAnimation = () => {
  // Fade in hero content
  gsap.from(".headline", {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.2
  });

  gsap.from(".subheadline", {
    y: 30,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.4
  });

  gsap.from(".cta-group .btn", {
    y: 20,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out",
    delay: 0.6
  });

  // Animating particles container from scale/opacity
  gsap.from(scene.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 2.5,
    ease: "power2.out"
  });
};

// Initialize
init();
startIntroAnimation();

// Extra polish / Bonus interaction
// Disperse particles softly on vertical scroll
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  // Reduce impact on canvas as we scroll down so it stays subtle when behind sections
  scene.position.y = scrollY * 0.5; // Simple scroll parallax
  camera.position.z = 1000 + (scrollY * 0.5);
});

// GSAP ScrollTrigger Animations for New Sections
gsap.registerPlugin(ScrollTrigger);

// Bento items reveal
gsap.utils.toArray('.bento-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    delay: (i % 3) * 0.1, // Stagger effect relative to grid position
    ease: "power2.out"
  });
});

// Process steps reveal
gsap.utils.toArray('.step').forEach((step, i) => {
  gsap.from(step, {
    scrollTrigger: {
      trigger: step,
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    x: -30,
    opacity: 0,
    duration: 0.8,
    delay: i * 0.2, // Stagger effect
    ease: "power2.out"
  });
});

// Team cards reveal
gsap.utils.toArray('.team-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    delay: (i % 4) * 0.1, // Stagger row by row
    ease: "power2.out"
  });
});

// Section Headers
gsap.utils.toArray('.section-header').forEach((header) => {
  gsap.from(header, {
    scrollTrigger: {
      trigger: header,
      start: "top 85%"
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
  });
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger-menu');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-links a, #nav-cta');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}
