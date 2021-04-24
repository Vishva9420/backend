const { http } = require('./app');
let socket = null;
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200']
    }
});

console.log('io Object created');


io.on('connection', socket => {
    console.log('socket created');
    this.socket = socket;
});

module.exports = { io, socket };