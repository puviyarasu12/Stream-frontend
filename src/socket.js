import io from 'socket.io-client';

const SOCKET_URL ='https://stream-backend-wxa4.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: () => localStorage.getItem('token')
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Add event listeners for room notifications and clip events
socket.on('poll-update', (poll) => {
  console.log('Poll updated:', poll);
});

socket.on('new-trivia', (trivia) => {
  console.log('New trivia:', trivia);
});

socket.on('new-clip', (clip) => {
  console.log('New clip:', clip);
});
