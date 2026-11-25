
import * as THREE from 'three';

import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createControls } from './controls.js';
import { createCombat } from './combat.js';
import { createUI } from './ui.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x82d4f5);
scene.fog = new THREE.Fog(0x82d4f5, 95, 250);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  .1,
  600
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.body.appendChild(renderer.domElement);

// Lighting
const ambient = new THREE.HemisphereLight(
  0xc9edff,
  0x47723e,
  2
);
scene.add(ambient);

const sunlight = new THREE.DirectionalLight(0xffedca, 3);
sunlight.position.set(-60, 100, 40);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -100;
sunlight.shadow.camera.right = 100;
sunlight.shadow.camera.top = 100;
sunlight.shadow.camera.bottom = -100;
scene.add(sunlight);

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(9, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xffe5a1 })
);
sun.position.set(-100, 90, -180);
scene.add(sun);

// Systems
const world = createWorld(scene);
const player = createPlayer(scene);
const controls = createControls(camera, renderer);
const combat = createCombat(scene, world.enemyPositions);
const ui = createUI();

camera.position.set(0, 6, 10);

let paused = false;
let jumpRequested = false;
let attackCooldown = 0;
let powerCooldown = 0;
let gameOver = false;

document.addEventListener('game-jump', () => {
  jumpRequested = true;
});

document.addEventListener('game-attack', () => {
  if (paused || gameOver || attackCooldown > 0) return;

  const hit = combat.attack(player);
  attackCooldown = .5;
  ui.notify(hit ? '⚔ ATTACK HIT!' : '⚔ SWING!');
});

document.addEventListener('game-power', () => {
  if (paused || gameOver || powerCooldown > 0) return;

  if (combat.power(player)) {
    powerCooldown = 1;
    ui.notify('✦ FRUIT POWER ACTIVATED!');
  } else {
    ui.notify('NOT ENOUGH FRUIT ENERGY!');
  }
});

document.getElementById('menuBtn').addEventListener('click', () => {
  paused = true;
});

document.getElementById('resumeBtn').addEventListener('click', () => {
  paused = false;
});

const clock = new THREE.Clock();

function update(dt, elapsed) {
  const input = controls.update();
  const yaw = controls.cameraDirection();

  attackCooldown = Math.max(0, attackCooldown - dt);
  powerCooldown = Math.max(0, powerCooldown - dt);

  // Movement relative to camera
  const forward = new THREE.Vector3(
    -Math.sin(yaw), 0, -Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(yaw), 0, -Math.sin(yaw)
  );

  const direction = new THREE.Vector3();

  direction.addScaledVector(forward, input.forward);
  direction.addScaledVector(right, input.right);

  if (direction.lengthSq() > 0) {
    direction.normalize();

    player.mesh.position.addScaledVector(
      direction, dt * 10
    );

    player.mesh.rotation.y = Math.atan2(
      direction.x, direction.z
    );
  }

  // Keep the character on the island
  const radius = Math.hypot(
    player.mesh.position.x,
    player.mesh.position.z
  );

  if (radius > 94) {
    player.mesh.position.setLength(94);
  }

  // Jump and gravity
  if (jumpRequested && player.grounded) {
    player.velocity.y = 11;
    player.grounded = false;
  }

  jumpRequested = false;

  player.velocity.y -= 25 * dt;
  player.mesh.position.y += player.velocity.y * dt;

  if (player.mesh.position.y <= 0) {
    player.mesh.position.y = 0;
    player.velocity.y = 0;
    player.grounded = true;
  }

  player.animate(elapsed, direction.lengthSq() > 0);

  // Smooth third-person camera
  const target = player.mesh.position.clone();
  target.y += 2.1;

  const distance = 9;
  const pitch = .25;

  const cameraPosition = new THREE.Vector3(
    target.x + Math.sin(yaw) * Math.cos(pitch) * distance,
    target.y + Math.sin(pitch) * distance + 1,
    target.z + Math.cos(yaw) * Math.cos(pitch) * distance
  );

  camera.position.lerp(cameraPosition, 1 - Math.pow(.001, dt));
  camera.lookAt(target);

  // Regenerate fruit energy
  player.energy = Math.min(100, player.energy + dt * 7);

  // Level system
  while (player.xp >= player.level * 100) {
    player.xp -= player.level * 100;
    player.level++;
    player.health = 100;
    ui.notify('LEVEL UP! LEVEL ' + player.level);
  }

  // Enemy attacks
  combat.enemies.forEach(enemy => {
    if (!enemy.userData.alive) return;

    enemy.userData.hitCooldown -= dt;

    const distance = enemy.position.distanceTo(player.mesh.position);

    if (distance < 2.5 && enemy.userData.hitCooldown <= 0) {
      player.health = Math.max(0, player.health - 8);
      enemy.userData.hitCooldown = 1.2;
      ui.notify('YOU ARE UNDER ATTACK!');
    }
  });

  if (player.health <= 0 && !gameOver) {
    gameOver = true;
    ui.notify('ADVENTURE OVER - REFRESH TO RESTART');
  }

  world.update(elapsed);
  combat.update(dt, player);
  ui.update(player, combat.defeated, dt);

  if (combat.defeated >= 3) {
    ui.notify('QUEST COMPLETED! + BONUS XP');
  }
}

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), .05);
  const elapsed = clock.elapsedTime * 1000;

  if (!paused && !gameOver) {
    update(dt, elapsed);
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
});

document.getElementById('loading').style.display = 'none';

animate();

console.log('FRUIT LEGENDS: NEW WORLD LOADED');
