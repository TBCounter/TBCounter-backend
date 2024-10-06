const { addNode, getAllNodes, removeNode, updateNodeStatus, getFirstReadyNode } = require('./redisNodes');

var { client } = require('./redisNodes')

const { addToQueue, pauseQueue, resumeQueue } = require('./queue')

const jwt = require('jsonwebtoken')
require('dotenv').config()

const db = require('./db/index')
/**
 * Listen on provided port, on all network interfaces.
 */

let nodeIo = null;
let userIo = null;
let OCRIo = null;

const { Server } = require("socket.io");

const { Chest, Session } = require('./storage');

const initializeSockets = (server) => {
    const io = new Server(server);

    userIo = io.of('/user');
    nodeIo = io.of('/node');
    OCRIo = io.of('/ocr');

    // node namespace
    nodeIo.on('connection', (socket) => {
        console.log('node connected');
        addNode(socket.id, 'ready');

        socket.on('session', async(sessionId, startTime) => {
            console.log(sessionId, startTime)
            await Session.create({ session_id: sessionId, start_time: startTime})
        })

        socket.on('cheststatus', async (status, chestId) => {
            const chest = await Chest.findByIdAndUpdate(chestId, { status })


            console.log('new chest', chest, status)
            if (status === 'UPLOADED') {
                addToQueue(chest)
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
    })

    OCRIo.on('connection', async (socket) => {
        console.log('ocr node connected');
        addNode(socket.id, 'ready', 'ocr');
        await resumeQueue()


        socket.on('process_response', async (message) => {
            console.log('OCR Readed chest', message)
            const { chestId, name, type, source, time } = message

            await Chest.findByIdAndUpdate(chestId, { name, type, source, time })
            updateNodeStatus(socket.id, 'ready', 'ocr')
        })

        socket.on('disconnect', async () => {
            removeNode(socket.id, 'ocr')
            await pauseQueue()
            console.log('node disconnected');
        });

        socket.on("status", async (message) => {
            console.log('node updated', { message, id: socket.id })
            updateNodeStatus(socket.id, message, 'ocr')
        });
    })

    // user namespace
    userIo.on('connection', async (socket) => {
        console.log("user connected")
        const token = socket.handshake.query.token;
        let jwttoken;
        if (!token) {
            socket.emit("user_auth", "failed: no token provided")
            socket.disconnect(true)
            return
        }
        try {
            jwttoken = jwt.verify(token, process.env.SECRET_JWT_TOKEN)
        } catch (err) {
            console.error(err.message)
            socket.emit("user_auth", "failed: bad token")
            socket.disconnect(true)
            return
        }
        console.log(jwttoken.user)

        const accounts = await db.accounts.findAll({ where: { userId: jwttoken.user } })

        let user_accounts = []
        for (const account of accounts) {
            user_accounts.push(account.dataValues)
        }

        function countNodesReduce(accumulator, currentValue) {
            JSON.parse(currentValue).status === 'ready' ? accumulator.idle++ : accumulator.busy++
            return accumulator
        }

        const user_nodes = Object.values(await getAllNodes()).reduce(countNodesReduce, { idle: 0, busy: 0 })
        const user_ocr_nodes = Object.values(await getAllNodes('ocr')).reduce(countNodesReduce, { idle: 0, busy: 0 })
        console.log(user_nodes, user_ocr_nodes)
        try {
            user_chests = await Chest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
            console.log(user_chests)
        } catch (err) {
            console.log(err)
        }

        let user_chest_status = {}
        for (let count = 0; count < user_chests.length; count++) {
            user_chest_status.status = user_chests[count]._id
            user_chest_status.count = user_chests[count].count
        }

        socket.emit("user_auth", "success")
        socket.emit("user_payload", { user_accounts, user_nodes, user_ocr_nodes, user_chest_status })
    });

    return io;
};

const getNodeIo = () => {
    if (!nodeIo) {
        throw new Error('Sockets not initialized yet');
    }
    return nodeIo;
};

const getOCRIo = () => {
    if (!OCRIo) {
        throw new Error('Sockets not initialized yet');
    }
    return OCRIo;
};

module.exports = { initializeSockets, nodeIo, userIo, client, getNodeIo, getOCRIo };