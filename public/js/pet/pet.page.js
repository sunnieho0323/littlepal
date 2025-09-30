(function () {
  const qs = new URLSearchParams(location.search);
  let petId = qs.get('petId'); 

  const petName     = document.getElementById('petName');
  const emotionChip = document.getElementById('emotionChip');
  const emotionLabel= document.getElementById('emotionLabel');
  const heart       = document.getElementById('heart');

  const moodFill    = document.getElementById('moodFill');
  const hungerFill  = document.getElementById('hungerFill');
  const thirstFill  = document.getElementById('thirstFill');

  const feedBtn     = document.getElementById('feedBtn');
  const drinkBtn    = document.getElementById('drinkBtn');
  const playBtn     = document.getElementById('playBtn');
  const log         = document.getElementById('log');

  const inviteBtn   = document.getElementById('inviteBtn');
  const friendInput = document.getElementById('friendPetId');
  const joinFriendBtn = document.getElementById('joinFriendBtn');
  const fxLayer     = document.getElementById('fxLayer');

  const adoptForm   = document.getElementById('adopt-form');
  const releaseBtn  = document.getElementById('release-btn');
  const petNameInput= document.getElementById('pet-name');
  const petTypeInput= document.getElementById('pet-type');

  const OWNER_ID = 'demo-user';

  const socket = io();
  socket.on('pet:update', (state) => {
    if (state?._id === petId) render(state, '🔔 realtime update');
  });
  socket.on('pet:released', (info) => {
    if (info?.ownerId === OWNER_ID) {
      petId = null;
      render({ name: 'No Pet', type: '', mood: 0, hunger: 0, thirst: 0 }, 'Pet released');
    }
  });

  function pulse(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
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
    petName.textContent = pet.name ? `${pet.name} (${pet.type})` : 'No Pet';
    setBar(moodFill, pet.mood || 0);
    setBar(hungerFill, pet.hunger || 0);
    setBar(thirstFill, pet.thirst ?? 0);
    if (pet.emotion) setEmotion(pet.emotion);
    if (note) log.textContent = `${note}: mood ${pet.mood}, hunger ${pet.hunger}, thirst ${pet.thirst}`;
  }

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
    if (!petId) return;
    try {
      const data = await PetAPI.getPet(petId);
      render(data, 'Loaded');
    } catch (e) {
      M.toast({ html: e.message || 'Failed to load pet.' });
    }
  }

  const action = (apiCall, label, emoji, animTarget) =>
    withCooldown(900, async () => {
      if (!petId) return M.toast({ html: 'No pet yet. Adopt one first.' });
      const data = await apiCall(petId);
      render(data, label);
      if (animTarget) pulse(animTarget, 'pop');
      burstEmoji(emoji, 42);
      M.toast({ html: label });
    });

  feedBtn .addEventListener('click', action(PetAPI.feed,  '🍖 Fed',   '🍗', feedBtn));
  drinkBtn.addEventListener('click', action(PetAPI.drink, '💧 Drank', '💧', drinkBtn));
  playBtn .addEventListener('click', action(PetAPI.play,  '🎮 Played','🎾', playBtn));

  if (adoptForm) {
    adoptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = petNameInput.value.trim();
      const type = petTypeInput.value;
      try {
        const res = await fetch('/api/pet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId: OWNER_ID, name, type })
        });
        const data = await res.json();
        if (res.ok) {
          petId = data._id;
          render(data, 'Pet adopted');
          M.toast({ html: `Adopted ${data.name} 🐾` });
        } else {
          M.toast({ html: data.error || 'Could not adopt pet' });
        }
      } catch (err) {
        M.toast({ html: 'Failed to adopt pet.' });
      }
    });
  }

  if (releaseBtn) {
    releaseBtn.addEventListener('click', async () => {
      if (!petId) return M.toast({ html: 'No pet to release.' });
      if (!confirm('Are you sure you want to release your pet?')) return;
      try {
        const res = await fetch(`/api/pet/by-owner/${OWNER_ID}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          petId = null;
          render({ name: 'No Pet', type: '', mood: 0, hunger: 0, thirst: 0 }, 'Pet released');
          M.toast({ html: 'Pet released successfully.' });
        } else {
          M.toast({ html: data.error || 'Could not release pet' });
        }
      } catch (err) {
        M.toast({ html: 'Failed to release pet.' });
      }
    });
  }

  inviteBtn.addEventListener('click', async () => {
    if (!petId) return M.toast({ html: 'No pet to share yet.' });
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
