const PetAPI = (() => {
  async function getPet(id) {
    const r = await fetch(`/api/pet/${id}`);
    if (!r.ok) throw new Error('load failed');
    return r.json();
  }

  async function createPet({ ownerId, name, type }) {
    const r = await fetch(`/api/pet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId, name, type }),
    });
    if (!r.ok) throw new Error((await r.json()).error || 'create failed');
    return r.json();
  }

  async function deleteByOwner(ownerId) {
    const r = await fetch(`/api/pet/by-owner/${ownerId}`, { method: 'DELETE' });
    if (!r.ok) throw new Error((await r.json()).error || 'delete failed');
    return r.json();
  }

  async function feed(id) {
    const r = await fetch(`/api/pet/${id}/feed`, { method: 'PATCH' });
    if (!r.ok) throw new Error((await r.json()).error || 'feed failed');
    return r.json();
  }

  async function drink(id) {
    const r = await fetch(`/api/pet/${id}/drink`, { method: 'PATCH' });
    if (!r.ok) throw new Error((await r.json()).error || 'drink failed');
    return r.json();
  }

  async function play(id) {
    const r = await fetch(`/api/pet/${id}/play`, { method: 'PATCH' });
    if (!r.ok) throw new Error((await r.json()).error || 'play failed');
    return r.json();
  }

  return {
    getPet,
    createPet,
    deleteByOwner,
    feed,
    drink,
    play,
  };
})();
