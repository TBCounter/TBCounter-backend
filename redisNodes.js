const redis = require('redis');
const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => {
    console.error('Rediska error:', err);
});



function addNode(nodeId, status) {
    console.log('node attached')
    client.hSet('nodes', nodeId, JSON.stringify({ status: status, timestamp: Date.now() }));
}

function updateNodeStatus(nodeId, status) {
    client.hSet('nodes', nodeId, JSON.stringify({status: status, timestamp: Date.now()}))
    }

function getNodeStatus(nodeId, callback) {
    client.hGet('nodes', nodeId, (err, data) => {
        if (err) throw err;
        if (data) {
            callback(JSON.parse(data));
        } else {
            callback(null);
        }
    });
}

function removeNode(nodeId) {
    client.hDel('nodes', nodeId);
}

function getAllNodes() {
    return client.hGetAll('nodes', (err, data) => {
        if (err) throw err;
        if (data) {
            let nodes = Object.keys(data).map(key => ({
                nodeId: key,
                ...JSON.parse(data[key])
            }));
            return nodes
        } else {
            return []
        }
    });
}

function deleteAllNodes() {
    client.flushAll()
}

module.exports = { client, addNode, updateNodeStatus, getNodeStatus, removeNode, getAllNodes, deleteAllNodes }