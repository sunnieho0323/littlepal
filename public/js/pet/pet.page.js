(function () {
  const qs = new URLSearchParams(location.search);
  const petId = qs.get('petId');

  const petName = document.getElementById('petName');
  const emotionChip = document.getElementById('emotionChip');
  const emotionLabel = document.getElementById('emotionLabel');
  const heart = document.getElementById('heart');

  const moodFill = document.getElementById('moodFill');
  const hungerFill = document.getElementById('hungerFill');
  const thirstFill = document.getElementById('thirstFill');

  const feedBtn = document.getElementById('feedBtn');
  const drinkBtn = document.getElementById('drinkBtn');
  const playBtn = document.getElementById('playBtn');
  const log = document.getElementById('log');

  if (!petId) {
    M.toast({ html: 'Add ?petId=... to the URL to load your pet.' });
    [feedBtn, drinkBtn, playBtn].forEach(b => b.classList.add('disabled'));
    return;
  }

  // Global realtime: server emits 'pet:update'; filter by petId
  const socket = io();
  socket.on('pet:update', (state) => {
    if (state?.petId === petId) render(state, '🔔 realtime update');
  });

  function setEmotion(emotion) {
    // chip styles
    emotionChip.classList.remove('is-happy', 'is-neutral', 'is-sad');
    if (emotion === 'happy') emotionChip.classList.add('is-happy');
    else if (emotion === 'neutral') emotionChip.classList.add('is-neutral');
    else emotionChip.classList.add('is-sad');

    emotionLabel.textContent = emotion;

    // heart pulse
    heart.textContent = emotion === 'happy' ? '❤' : (emotion === 'neutral' ? '♡' : '♥');
    heart.classList.add('pulse');
    setTimeout(() => heart.classList.remove('pulse'), 500);
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
    if (note) {
      log.textContent = `${note}: mood ${pet.mood}, hunger ${pet.hunger}, thirst ${pet.thirst}`;
    }
  }

  async function load() {
    try {
      const data = await PetAPI.getPet(petId);
      render(data, 'Loaded');
    } catch (e) {
      M.toast({ html: e.message || 'Failed to load pet.' });
    }
  }

  const wrap = (fn, label) => async () => {
    try {
      const data = await fn(petId);
      render(data, label);
      M.toast({ html: label });
    } catch (e) {
      M.toast({ html: e.message || 'Action failed' });
    }
  };

  feedBtn.addEventListener('click',  wrap(PetAPI.feed,  '🍖 Fed'));
  drinkBtn.addEventListener('click', wrap(PetAPI.drink, '💧 Drank'));
  playBtn.addEventListener('click',  wrap(PetAPI.play,  '🎮 Played'));

  load();
})();
