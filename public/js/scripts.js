const socket = io();

socket.on('number', (msg) => {
    console.log('Random number:', msg);
    document.getElementById('number').innerText = msg;
});