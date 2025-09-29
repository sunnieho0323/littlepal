(function () {
  const qs = new URLSearchParams(location.search);
  const petId = qs.get('petId');

  const petName = document.getElementById('petName');
  const emotionChip = document.getElementById('emotionChip');
  const emotionLabel = document.getElementById('emotionLabel');
  const heart = document.getElementById('heart'); // heart chip

  const moodFill = document.getElementById('moodFill');
  const hungerFill = document.getElementById('hungerFill');
  const thirstFill = document.getElementById('thirstFill');

  const feedBtn  = document.getElementById('feedBtn');
  const drinkBtn = document.getElementById('drinkBtn');
  const playBtn  = document.getElementById('playBtn');
  const log = document.getElementById('log');

  const inviteBtn     = document.getElementById('inviteBtn');
  const friendInput   = document.getElementById('friendPetId');
  const joinFriendBtn = document.getElementById('joinFriendBtn');
  const fxLayer       = document.getElementById('fxLayer');

  if (!petId) {
    M.toast({ html: 'Add ?petId=... to the URL to load your pet.' });
    [feedBtn, drinkBtn, playBtn].forEach(b => b?.classList.add('disabled'));
    return;
  }

  // Realtime via global channel (server emits `pet:update` for all)
  const socket = io();
  socket.on('pet:update', (state) => {
    if (state?.petId === petId) render(state, '🔔 realtime update');
  });

  function pulse(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // reflow to restart animation
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 500);
  }

  function burstEmoji(emoji, x = 24) {
    const span = document.createElement('span');
    span.className = 'float-emoji';
    span.textContent = emoji;
    span.style.left = `${x}px`;
    span.style.top = `-8px`;
    fxLayer.appendChild(span);
    setTimeout(() => span.remove(), 900);
  }

  function setEmotion(emotion) {
    emotionChip.classList.remove('is-happy', 'is-neutral', 'is-sad');
    if (emotion === 'happy') emotionChip.classList.add('is-happy');
    else if (emotion === 'neutral') emotionChip.classList.add('is-neutral');
    else emotionChip.classList.add('is-sad');

    emotionLabel.textContent = emotion;

    heart.textContent = emotion === 'happy' ? '❤' : (emotion === 'neutral' ? '♡' : '♥');
    pulse(heart, 'pulse');
  }

  function setBar(el, value) {
    el.style.width = `${Math.max(0, Math.min(100, value))}%`;
  }

  function render(pet, note) {
    petName.textContent = `${pet.name || 'Pet'} (${pet.type || 'cat'})`;
    setBar(moodFill, pet.mood);
    setBar(hungerFill, pet.hunger);
    setBar(thirstFill, pet.thirst ?? 50);
    if (pet.emotion) setEmotion(pet.emotion);
    if (note) log.textContent = `${note}: mood ${pet.mood}, hunger ${pet.hunger}, thirst ${pet.thirst}`;
  }

  // Basic cooldown to prevent spam clicking (matches service ~3s)
  let cooling = false;
  function withCooldown(ms, fn) {
    return async () => {
      if (cooling) return M.toast({ html: 'Slow down a bit 😊' });
      cooling = true;
      try { await fn(); } finally {
        setTimeout(() => (cooling = false), ms);
      }
    };
  }

  async function load() {
    try {
      const data = await PetAPI.getPet(petId);
      render(data, 'Loaded');
    } catch (e) {
      M.toast({ html: e.message || 'Failed to load pet.' });
    }
  }

  const action = (apiCall, label, emoji, animTarget) =>
    withCooldown(900, async () => {
      const data = await apiCall(petId);
      render(data, label);
      if (animTarget) pulse(animTarget, 'pop');
      burstEmoji(emoji, 42);
      M.toast({ html: label });
    });

  feedBtn .addEventListener('click', action(PetAPI.feed,  '🍖 Fed',   '🍗', feedBtn));
  drinkBtn.addEventListener('click', action(PetAPI.drink, '💧 Drank', '💧', drinkBtn));
  playBtn .addEventListener('click', action(PetAPI.play,  '🎮 Played','🎾', playBtn));

  // Friends
  inviteBtn.addEventListener('click', async () => {
    const url = `${location.origin}/pet.html?petId=${encodeURIComponent(petId)}`;
    try {
      await navigator.clipboard.writeText(url);
      M.toast({ html: 'Link copied! Share with your friend.' });
    } catch {
      prompt('Copy this link:', url);
    }
  });

  joinFriendBtn.addEventListener('click', () => {
    const id = (friendInput.value || '').trim();
    if (!id) return M.toast({ html: 'Paste a petId first.' });
    location.href = `/pet.html?petId=${encodeURIComponent(id)}`;
  });

  load();
})();
