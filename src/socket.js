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


socket.on('new-trivia', (trivia) => {
  console.log('New trivia:', trivia);
});

