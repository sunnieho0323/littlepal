import { getUser } from './app.js';

export const socket = io({ withCredentials: true });

const u = getUser();
if (u?.id) socket.emit('join', { userId: u.id });

// listen for memo updates
// socket.on('memo:updated', (payload) => { /* update UI */ });