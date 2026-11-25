
import * as THREE from 'three';

export function createWorld(scene) {
  const mat = (color, roughness = 0.85) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const groundMat = mat(0x63b94f);
  const sandMat = mat(0xe7d19a);
  const trunkMat = mat(0x75452b);
  const leafMat = mat(0x167d48);
  const rockMat = mat(0x657987);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(100, 96),
    groundMat
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  scene.add(ground);

  const sand = new THREE.Mesh(
    new THREE.CircleGeometry(104, 96),
    sandMat
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = -0.28;
  scene.add(sand);

  const waterGeometry = new THREE.PlaneGeometry(700, 700, 100, 100);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x087dbb,
    roughness: 0.22,
    metalness: 0.25,
    transparent: true,
    opacity: 0.92
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.5;
  scene.add(water);

  const original = waterGeometry.attributes.position.array.slice();

  function tree(x, z, scale = 1) {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(.28, .42, 4, 9),
      trunkMat
    );
    trunk.position.y = 2;

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 10, 9),
      leafMat
    );
    leaves.position.y = 4.4;

    group.add(trunk, leaves);
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    scene.add(group);
  }

  for (let i = 0; i < 70; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 28 + Math.random() * 68;
    tree(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      .7 + Math.random() * .7
    );
  }

  for (let i = 0; i < 20; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1 + Math.random() * 2, 0),
      rockMat
    );
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * 65;
    rock.position.set(
      Math.cos(angle) * radius,
      .5,
      Math.sin(angle) * radius
    );
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(rock);
  }

  // Distant mountains
  for (let i = 0; i < 18; i++) {
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(12 + Math.random() * 15, 28 + Math.random() * 35, 6),
      mat(0x477c75)
    );
    const angle = i / 18 * Math.PI * 2;
    mountain.position.set(
      Math.cos(angle) * 95,
      12,
      Math.sin(angle) * 95
    );
    scene.add(mountain);
  }

  // Beginner village
  for (let i = 0; i < 5; i++) {
    const house = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(7, 5, 6),
      mat(0xe8d6ac)
    );
    body.position.y = 2.5;

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5.5, 4, 4),
      mat(0x9b3d36)
    );
    roof.position.y = 7;
    roof.rotation.y = Math.PI / 4;

    house.add(body, roof);
    house.position.set(-28 + i * 13, 0, -25);
    scene.add(house);
  }

  // Enemy spawn positions
  const enemyPositions = [
    [15, 10], [22, -5], [-12, 18],
    [35, 15], [-22, -12], [8, -28]
  ];

  function update(time) {
    const positions = waterGeometry.attributes.position;
    const a = positions.array;

    for (let i = 0; i < a.length; i += 3) {
      const x = original[i];
      const y = original[i + 1];
      a[i + 2] = original[i + 2] +
        Math.sin(x * .035 + time * .001) * .28 +
        Math.cos(y * .045 + time * .0014) * .2;
    }
    positions.needsUpdate = true;
    waterGeometry.computeVertexNormals();
  }

  return { update, enemyPositions };
}
