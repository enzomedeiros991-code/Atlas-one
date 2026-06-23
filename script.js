import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.querySelector("#scene");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 3.2;
controls.maxDistance = 12;

// Luz ambiente suave
scene.add(new THREE.AmbientLight(0x2a4b73, 0.9));

// Sol visual e luz principal
const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
scene.add(sunLight);

const sunGeometry = new THREE.SphereGeometry(0.42, 48, 48);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfff1a8 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Terra
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const earthGeometry = new THREE.SphereGeometry(1.55, 96, 96);

const earthTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
);

const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  roughness: 0.9,
  metalness: 0.02
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);

// Nuvens
const cloudTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
);

const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(1.585, 96, 96),
  new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.42,
    depthWrite: false
  })
);
earthGroup.add(clouds);

// Atmosfera azul
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.62, 96, 96),
  new THREE.MeshBasicMaterial({
    color: 0x46d9ff,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide
  })
);
earthGroup.add(atmosphere);

// Lua
const moonTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/moon_1024.jpg"
);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.34, 48, 48),
  new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 1 })
);
scene.add(moon);

// Estrelas
const starGeometry = new THREE.BufferGeometry();
const starCount = 2500;
const positions = [];

for (let i = 0; i < starCount; i++) {
  const radius = 70;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  positions.push(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.09,
    sizeAttenuation: true
  })
);
scene.add(stars);

// Constelações estilizadas
const constellationGroup = new THREE.Group();
scene.add(constellationGroup);

function createConstellation(points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x6deaff,
    transparent: true,
    opacity: 0.35
  });
  const line = new THREE.Line(geometry, material);
  constellationGroup.add(line);

  points.forEach(point => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    dot.position.copy(point);
    constellationGroup.add(dot);
  });
}

createConstellation([
  new THREE.Vector3(-7, 5, -13),
  new THREE.Vector3(-6.2, 5.6, -13),
  new THREE.Vector3(-5.3, 5.2, -13),
  new THREE.Vector3(-4.7, 6.1, -13),
  new THREE.Vector3(-3.8, 5.7, -13)
]);

createConstellation([
  new THREE.Vector3(5, -3, -12),
  new THREE.Vector3(5.8, -2.2, -12),
  new THREE.Vector3(6.7, -2.5, -12),
  new THREE.Vector3(7.4, -1.8, -12)
]);

createConstellation([
  new THREE.Vector3(2, 6, -15),
  new THREE.Vector3(2.5, 6.8, -15),
  new THREE.Vector3(3.3, 6.2, -15),
  new THREE.Vector3(4, 7, -15),
  new THREE.Vector3(4.7, 6.4, -15)
]);

// Grade futurista orbital
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.05, 0.008, 12, 160),
  new THREE.MeshBasicMaterial({ color: 0x42d9ff, transparent: true, opacity: 0.35 })
);
ring.rotation.x = Math.PI / 2.5;
earthGroup.add(ring);

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function moonPhaseData(date) {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const lunarCycle = 29.53058867;
  const daysSince = (date - knownNewMoon) / 86400000;
  const age = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = (1 - Math.cos((age / lunarCycle) * Math.PI * 2)) / 2;

  let name = "Lua Nova";
  if (age >= 1.845 && age < 5.536) name = "Lua Crescente Inicial";
  else if (age >= 5.536 && age < 9.228) name = "Quarto Crescente";
  else if (age >= 9.228 && age < 12.919) name = "Crescente Gibosa";
  else if (age >= 12.919 && age < 16.611) name = "Lua Cheia";
  else if (age >= 16.611 && age < 20.302) name = "Minguante Gibosa";
  else if (age >= 20.302 && age < 23.994) name = "Quarto Minguante";
  else if (age >= 23.994 && age < 27.685) name = "Lua Minguante Final";

  return { age, illumination, name };
}

function updateHud() {
  const now = new Date();

  document.querySelector("#utcTime").textContent =
    "UTC: " + now.toISOString().slice(11, 19);

  document.querySelector("#localTime").textContent =
    "Local: " + now.toLocaleTimeString("pt-BR");

  document.querySelector("#dayInfo").textContent =
    "Dia do ano: " + dayOfYear(now);

  const moonData = moonPhaseData(now);
  document.querySelector("#moonPhase").textContent = moonData.name;
  document.querySelector("#moonAge").textContent =
    "Idade lunar: " + moonData.age.toFixed(1) + " dias";

  document.querySelector("#moonMeterFill").style.width =
    Math.round(moonData.illumination * 100) + "%";
}

function setCelestialPositions() {
  const now = new Date();

  // Rotação baseada no horário UTC: simples, mas funcional para a versão 0.1
  const seconds =
    now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();

  const dayAngle = (seconds / 86400) * Math.PI * 2;

  sun.position.set(Math.cos(dayAngle) * 7, 1.2, Math.sin(dayAngle) * 7);
  sunLight.position.copy(sun.position);

  const moonData = moonPhaseData(now);
  const moonAngle = (moonData.age / 29.53058867) * Math.PI * 2;

  moon.position.set(
    Math.cos(moonAngle) * 4.2,
    Math.sin(moonAngle * 0.7) * 0.8,
    Math.sin(moonAngle) * 4.2
  );
}

function animate() {
  requestAnimationFrame(animate);

  const now = new Date();
  const seconds =
    now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();

  // Terra gira em 24h, acelerada visualmente só um pouquinho para sentir vida
  earth.rotation.y = (seconds / 86400) * Math.PI * 2;
  clouds.rotation.y = earth.rotation.y + performance.now() * 0.000025;
  stars.rotation.y += 0.00003;
  constellationGroup.rotation.y += 0.00002;
  ring.rotation.z += 0.001;

  setCelestialPositions();
  controls.update();
  renderer.render(scene, camera);
}

setInterval(updateHud, 1000);
updateHud();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
