
import * as THREE from 'three';

export function createPlayer(scene) {
  const player = new THREE.Group();

  const skin = new THREE.MeshStandardMaterial({ color: 0xffc99e });
  const clothes = new THREE.MeshStandardMaterial({ color: 0x1769a3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x202536 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x191522 });
  const eyes = new THREE.MeshStandardMaterial({ color: 0x141b2c });

  function part(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    player.add(mesh);
    return mesh;
  }

  // Torso
  part(new THREE.BoxGeometry(1.15, 1.35, .65), clothes, 0, 1.85, 0);

  // Head
  part(new THREE.SphereGeometry(.48, 24, 20), skin, 0, 2.95, 0);

  // Hair
  part(new THREE.SphereGeometry(.51, 16, 12), hair, 0, 3.22, -.06);

  // Eyes
  part(new THREE.SphereGeometry(.055, 10, 10), eyes, -.17, 2.99, .445);
  part(new THREE.SphereGeometry(.055, 10, 10), eyes, .17, 2.99, .445);

  // Arms
  const leftArm = part(
    new THREE.CapsuleGeometry(.16, .72, 5, 10),
    skin, -.78, 1.85, 0
  );
  const rightArm = part(
    new THREE.CapsuleGeometry(.16, .72, 5, 10),
    skin, .78, 1.85, 0
  );

  // Sleeves
  part(new THREE.BoxGeometry(.35, .45, .42), clothes, -.72, 2.25, 0);
  part(new THREE.BoxGeometry(.35, .45, .42), clothes, .72, 2.25, 0);

  // Legs
  const leftLeg = part(
    new THREE.CapsuleGeometry(.19, .72, 5, 10),
    dark, -.3, .65, 0
  );
  const rightLeg = part(
    new THREE.CapsuleGeometry(.19, .72, 5, 10),
    dark, .3, .65, 0
  );

  // Belt
  part(new THREE.BoxGeometry(1.18, .16, .7), dark, 0, 1.15, 0);

  player.position.set(0, 0, 0);
  scene.add(player);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(.8, 24),
    new THREE.MeshBasicMaterial({
      color: 0x001018,
      transparent: true,
      opacity: .35
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = .04;
  player.add(shadow);

  return {
    mesh: player,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    velocity: new THREE.Vector3(),
    health: 100,
    energy: 100,
    xp: 0,
    level: 1,
    grounded: true,
    attackTime: 0,
    animate(time, moving) {
      const swing = moving ? Math.sin(time * .012) * .65 : 0;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;
    }
  };
}
