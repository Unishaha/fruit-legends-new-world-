
export function createUI() {
  const $ = id => document.getElementById(id);

  const message = $('message');
  let messageTimer = 0;

  function notify(text) {
    message.textContent = text;
    messageTimer = 2;
  }

  $('menuBtn').addEventListener('click', () => {
    $('menu').classList.remove('hidden');
  });

  $('resumeBtn').addEventListener('click', () => {
    $('menu').classList.add('hidden');
  });

  $('attackBtn').addEventListener('click', () => {
    document.dispatchEvent(new Event('game-attack'));
  });

  $('powerBtn').addEventListener('click', () => {
    document.dispatchEvent(new Event('game-power'));
  });

  $('jumpBtn').addEventListener('click', () => {
    document.dispatchEvent(new Event('game-jump'));
  });

  return {
    notify,

    update(player, defeated, dt) {
      $('level').textContent = player.level;
      $('healthText').textContent =
        Math.ceil(player.health) + ' / 100';

      $('healthBar').style.width =
        Math.max(0, player.health) + '%';

      $('energyText').textContent =
        Math.floor(player.energy) + '%';

      $('energyBar').style.width =
        player.energy + '%';

      $('xpText').textContent =
        player.xp + ' / ' + (player.level * 100) + ' XP';

      $('xpBar').style.width =
        (player.xp / (player.level * 100) * 100) + '%';

      $('questCount').textContent =
        'Progress: ' + defeated + ' / 3';

      messageTimer -= dt;
      if (messageTimer <= 0) message.textContent = '';
    }
  };
}
