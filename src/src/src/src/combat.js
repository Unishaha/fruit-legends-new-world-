
import * as THREE from 'three';

export function createCombat(scene, positions) {
  const enemies = [];
  const effects = [];

  const enemyMaterial = new THREE.MeshStandardMaterial({
    color: 0x9c3947,
    roughness: .65
  });

  positions.forEach(([x, z], index) => {
    const enemy = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.6, .75),
      enemyMaterial
    );
    body.position.y = 1.3;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(.4, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xd5a17e })
    );
    head.position.y = 2.35;

    const weapon = new THREE.Mesh(
      new THREE.BoxGeometry(.12, 1.3, .12),
      new THREE.MeshStandardMaterial({ color: 0xd1d9e0 })
    );
    weapon.position.set(.75, 1.5, 0);

    enemy.add(body, head, weapon);
    enemy.position.set(x, 0, z);
    enemy.userData = {
      hp: 100,
      alive: true,
      hitCooldown: 0,
      index
    };

    scene.add(enemy);
    enemies.push(enemy);
  });

  function makeEffect(position, color, size) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 12, 12),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: .8
      })
    );

    mesh.position.copy(position);
    scene.add(mesh);

    effects.push({
      mesh,
      life: .45,
      maxLife: .45,
      speed: 7
    });
  }

  function attack(player) {
    const origin = player.mesh.position;
    let hit = false;

    enemies.forEach(enemy => {
      if (!enemy.userData.alive) return;

      const distance = enemy.position.distanceTo(origin);

      if (distance < 4.2) {
        enemy.userData.hp -= 35;
        makeEffect(
          enemy.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
          0xffb044,
          .45
        );
        hit = true;

        if (enemy.userData.hp <= 0) {
          enemy.userData.alive = false;
          enemy.visible = false;
          player.xp += 35;
        }
      }
    });

    return hit;
  }

  function power(player) {
    if (player.energy < 30) return false;

    player.energy -= 30;

    const origin = player.mesh.position;

    enemies.forEach(enemy => {
      if (!enemy.userData.alive) return;

      if (enemy.position.distanceTo(origin) < 11) {
        enemy.userData.hp -= 65;

        makeEffect(
          enemy.position.clone().add(new THREE.Vector3(0, 1, 0)),
          0x9b47ff,
          1.1
        );

        if (enemy.userData.hp <= 0) {
          enemy.userData.alive = false;
          enemy.visible = false;
          player.xp += 35;
        }
      }
    });

    // Purple energy ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5, .18, 8, 48),
      new THREE.MeshBasicMaterial({
        color: 0xb64dff,
        transparent: true,
        opacity: .9
      })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.copy(origin);
    ring.position.y = .5;
    scene.add(ring);

    effects.push({
      mesh: ring,
      life: .65,
      maxLife: .65,
      speed: 12
    });

    return true;
  }

  function update(dt, player) {
    enemies.forEach(enemy => {
      if (!enemy.userData.alive) return;

      const distance = enemy.position.distanceTo(player.mesh.position);

      if (distance < 15 && distance > 2.5) {
        const direction = player.mesh.position.clone()
          .sub(enemy.position).normalize();

        enemy.position.addScaledVector(direction, dt * 2.3);

        enemy.rotation.y = Math.atan2(direction.x, direction.z);
      }
    });

    for (let i = effects.length - 1; i >= 0; i--) {
      const effect = effects[i];

      effect.life -= dt;
      const progress = 1 - effect.life / effect.maxLife;

      effect.mesh.scale.setScalar(1 + progress * 3);

      if (effect.mesh.material) {
        effect.mesh.material.opacity = Math.max(0, effect.life / effect.maxLife);
      }

      if (effect.life <= 0) {
        scene.remove(effect.mesh);
        effect.mesh.geometry.dispose();
        effect.mesh.material.dispose();
        effects.splice(i, 1);
      }
    }
  }

  return {
    enemies,
    attack,
    power,
    update,
    get defeated() {
      return enemies.filter(e => !e.userData.alive).length;
    }
  };
}
