const PetAPI = (() => {
  async function getPet(id){
    const r = await fetch(`/api/pet/${id}`);
    if(!r.ok) throw new Error('load failed');
    return r.json();
  }
  async function feed(id){
    const r = await fetch(`/api/pet/${id}/feed`, { method:'POST' });
    if(!r.ok) throw new Error((await r.json()).error || 'feed failed');
    return r.json();
  }
  async function drink(id){
    const r = await fetch(`/api/pet/${id}/drink`, { method:'POST' });
    if(!r.ok) throw new Error((await r.json()).error || 'drink failed');
    return r.json();
  }
  async function play(id){
    const r = await fetch(`/api/pet/${id}/play`, { method:'POST' });
    if(!r.ok) throw new Error((await r.json()).error || 'play failed');
    return r.json();
  }
  return { getPet, feed, drink, play };
})();
