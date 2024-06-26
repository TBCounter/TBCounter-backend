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
    client.hGet('nodes', nodeId, (err, data) => {
        if (err) throw err;
        if (data) {
            let node = JSON.parse(data);
            node.status = status;
            node.timestamp = Date.now();
            client.hSet('nodes', nodeId, JSON.stringify(node));
        }
    });
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

module.exports = { client, addNode, updateNodeStatus, getNodeStatus, removeNode, getAllNodes }