
export function createControls(camera, renderer) {
  const keys = {};
  let dragging = false;
  let previousX = 0;
  let previousY = 0;

  const state = {
    yaw: 0,
    pitch: .22,
    forward: 0,
    right: 0
  };

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  renderer.domElement.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') {
      dragging = true;
      previousX = e.clientX;
      previousY = e.clientY;
    }
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
  });

  window.addEventListener('pointermove', e => {
    if (!dragging || e.pointerType !== 'mouse') return;

    state.yaw -= (e.clientX - previousX) * .006;
    state.pitch += (e.clientY - previousY) * .004;
    state.pitch = Math.max(-.15, Math.min(.85, state.pitch));

    previousX = e.clientX;
    previousY = e.clientY;
  });

  // Touch movement buttons
  document.querySelectorAll('[data-move]').forEach(button => {
    const direction = button.dataset.move;

    const start = e => {
      e.preventDefault();
      keys['Touch' + direction] = true;
    };

    const stop = e => {
      e.preventDefault();
      keys['Touch' + direction] = false;
    };

    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
  });

  function down(code) {
    return !!keys[code];
  }

  return {
    get moving() {
      return Math.abs(state.forward) + Math.abs(state.right) > 0;
    },

    get jump() {
      return down('Space') || down('Touchjump');
    },

    update() {
      state.forward =
        (down('KeyW') || down('ArrowUp') || down('Touchforward') ? 1 : 0) -
        (down('KeyS') || down('ArrowDown') || down('Touchbackward') ? 1 : 0);

      state.right =
        (down('KeyD') || down('ArrowRight') || down('Touchright') ? 1 : 0) -
        (down('KeyA') || down('ArrowLeft') || down('Touchleft') ? 1 : 0);

      return state;
    },

    cameraDirection() {
      return state.yaw;
    }
  };
}
