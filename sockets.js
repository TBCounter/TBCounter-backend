var app = require('./app');
var http = require('http');

var server = http.createServer(app);

var { client, addNode, updateNodeStatus, getNodeStatus, removeNode, getAllNodes } = require('./redisNodes')

/**
 * Listen on provided port, on all network interfaces.
 */



const { Server } = require("socket.io");
const io = new Server(server);

const userIo = io.of('/user')
const nodeIo = io.of('/node')

//node namespace
nodeIo.on('connection', (socket) => {
    console.log('node connected');

    addNode(socket.id, 'ready')

    socket.on('disconnect', async () => {
        console.log(await getAllNodes())
        console.log('node disconnected');
    });

    socket.emit('run_account', {
        address: 'https://totalbattle.com',
        cookies: {

        }
    })
});

//user namespace
userIo.on('connection', (socket) => {
    console.log('user connected');
});

module.exports = { server, client };
