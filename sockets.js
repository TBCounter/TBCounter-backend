
// var { client, addNode, updateNodeStatus, getNodeStatus, removeNode, getAllNodes } = require('./redisNodes')
var { client } = require('./redisNodes')

/**
 * Listen on provided port, on all network interfaces.
 */

let nodeIo = null;
let userIo = null;

const { Server } = require("socket.io");

const { Chest } = require('./storage')


const initializeSockets = (server) => {
    const io = new Server(server);

    userIo = io.of('/user');
    nodeIo = io.of('/node');
    OCRIo = io.of('/ocr');

    const { addNode, getAllNodes, removeNode, updateNodeStatus, getFirstReadyNode } = require('./redisNodes');

    // node namespace
    nodeIo.on('connection', (socket) => {
        console.log('node connected');
        addNode(socket.id, 'ready');

        socket.on('cheststatus', async (status, chestId) => {
            const chest = await Chest.findByIdAndUpdate(chestId, { status })
            console.log('new chest', chest, status)
            if (status === 'UPLOADED') {
                console.log('yes, uploaded status')
                const readyOCRNode = await getFirstReadyNode('ocr')
                console.log('readyOCRNode', readyOCRNode)
                console.log('readyOCRNode', Object.keys(readyOCRNode))
                if (!Object.keys(readyOCRNode).length) {
                    console.log('no ready ocr nodes')
                    return
                }
                OCRIo.to(Object.keys(readyOCRNode)[0]).emit('process', chest)
                updateNodeStatus(Object.keys(readyOCRNode)[0], 'busy', 'ocr')
            }
        })

        socket.on('disconnect', async () => {
            console.log(await getAllNodes());
            removeNode(socket.id)
            console.log('node disconnected');
        });

        socket.on("status", async (message) => {
            console.log('node updated', { message, id: socket.id })
            updateNodeStatus(socket.id, message)
        });
    });


    OCRIo.on('connection', (socket) => {
        console.log('ocr node connected');
        addNode(socket.id, 'ready', 'ocr');


        socket.on('process_response', async (message) => {
            const { chestId, name, type, source, time, status } = message
            await Chest.findByIdAndUpdate(chestId, { name, type, source, time, status })
            updateNodeStatus(socket.id, 'ready', 'ocr')
        })

        socket.on('disconnect', async () => {
            removeNode(socket.id, 'ocr')
            console.log('node disconnected');
        });

        socket.on("status", async (message) => {
            console.log('node updated', { message, id: socket.id })
            updateNodeStatus(socket.id, message, 'ocr')
        });
    })

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