// public/js/memo/memo.page.js
import { listMemos, createMemo, completeMemo, deleteMemo } from './memo.api.js';
import { toast } from '../common/app.js';
import './memo.socket.js'; // if you want to saprately handle socket events

const form = document.getElementById('memo-form');
const input = document.getElementById('memo-input');
const list = document.getElementById('memo-list');

function renderItem(m) {
  const li = document.createElement('li');
  li.className = 'collection-item';
  li.dataset.id = m._id;
  li.innerHTML = `
    <span ${m.done ? 'style="text-decoration:line-through;"' : ''}>${m.text}</span>
    <div class="secondary-content">
      <a class="btn-flat complete">Done</a>
      <a class="btn-flat red-text delete">Del</a>
    </div>`;
  return li;
}

async function refresh() {
  list.innerHTML = '';
  const items = await listMemos();
  items.forEach(m => list.appendChild(renderItem(m)));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  await createMemo(input.value.trim());
  input.value = '';
  toast('Added!');
  await refresh();
});

list.addEventListener('click', async (e) => {
  const li = e.target.closest('li.collection-item');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.classList.contains('complete')) {
    await completeMemo(id);
    toast('Completed!');
    await refresh();
  }
  if (e.target.classList.contains('delete')) {
    await deleteMemo(id);
    toast('Deleted!');
    li.remove();
  }
});

document.addEventListener('DOMContentLoaded', refresh);
