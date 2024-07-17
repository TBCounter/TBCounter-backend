const { addNode, getAllNodes, removeNode, updateNodeStatus, getFirstReadyNode } = require('./redisNodes');

var { client } = require('./redisNodes')
var Bull = require('bull')

/**
 * Listen on provided port, on all network interfaces.
 */

let nodeIo = null;
let userIo = null;

const { Server } = require("socket.io");

const { Chest } = require('./storage')

// init bull

const queueOpts = { 
    redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}
}

const OCRQueue = new Bull('OCRProcess', queueOpts)

const initializeSockets = (server) => {
    const io = new Server(server);

    userIo = io.of('/user');
    nodeIo = io.of('/node');
    OCRIo = io.of('/ocr');

    

    // node namespace
    nodeIo.on('connection', (socket) => {
        console.log('node connected');
        addNode(socket.id, 'ready');

        OCRQueue.process(async (payload, done) => {
        console.log('Queue started')
        try {
            payload.progress(0)
            await Chest.findByIdAndUpdate(payload.data.chest._id, { status: 'PROCESSING' })
            payload.progress(10)
            // Sending chest to process
            const readyOCRNode = await getFirstReadyNode('ocr')
            if (!Object.keys(readyOCRNode).length) {
                console.log('no ready ocr nodes')
                return
            }
            payload.progress(20)
            OCRIo.to(Object.keys(readyOCRNode)[0]).emit('process', payload.data.chest)
            payload.progress(30)
            updateNodeStatus(Object.keys(readyOCRNode)[0], 'busy', 'ocr')
            payload.progress(40)

            done()
    } catch (err) {
        console.log(err)
        done(err)
    }
})

OCRQueue.on('completed', async (job) => {
    console.log(`${job.id} completed`)
    await Chest.findByIdAndUpdate(job.data.chest._id, { status: 'PROCESSED' })
})

OCRQueue.on('failed', async (job) => {
    console.log(`${job.id} failed`)
    await Chest.findByIdAndUpdate(job.data.chest._id, { status: 'ERROR' })
})
        socket.on('cheststatus', async (status, chestId) => {
            const chest = await Chest.findByIdAndUpdate(chestId, { status })
            console.log('new chest', chest, status)
            if (status === 'UPLOADED') {
                OCRQueue.add({chest: chest})
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
            updateNodeStatus(socket.id, 'ready', 'ocr')})

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

module.exports = { initializeSockets, nodeIo, userIo, client, getNodeIo, OCRQueue };