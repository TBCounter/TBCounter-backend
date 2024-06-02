
// var { client, addNode, updateNodeStatus, getNodeStatus, removeNode, getAllNodes } = require('./redisNodes')
var { client } = require('./redisNodes')

/**
 * Listen on provided port, on all network interfaces.
 */

let nodeIo = null;
let userIo = null;

const { Server } = require("socket.io");


const initializeSockets = (server) => {
    const io = new Server(server);

    userIo = io.of('/user');
    nodeIo = io.of('/node');

    const { addNode, getAllNodes, removeNode } = require('./redisNodes');

    // node namespace
    nodeIo.on('connection', (socket) => {
        console.log('node connected');
        addNode(socket.id, 'ready');

        socket.on('disconnect', async () => {
            console.log(await getAllNodes());
            removeNode(socket.id)
            console.log('node disconnected');
        });
    });

    // user namespace
    userIo.on('connection', (socket) => {
        console.log('user connected');
    });

    return io;
};

const getNodeIo = () => {
    if (!nodeIo) {
        throw new Error('Sockets not initialized yet');
    }
    return nodeIo;
};

module.exports = { initializeSockets, nodeIo, userIo, client, getNodeIo };