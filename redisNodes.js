const redis = require('redis');
const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => {
    console.error('Rediska error:', err);
});



function addNode(nodeId, status, storage) {
    client.hSet(storage || 'nodes', nodeId, JSON.stringify({ status: status, timestamp: Date.now() }));
}

function updateNodeStatus(nodeId, status, storage) {
    client.hSet(storage || 'nodes', nodeId, JSON.stringify({ status: status, timestamp: Date.now() }))
}

function getNodeStatus(nodeId, callback, storage) {
    client.hGet(storage || 'nodes', nodeId, (err, data) => {
        if (err) throw err;
        if (data) {
            callback(JSON.parse(data));
        } else {
            callback(null);
        }
    });
}

function removeNode(nodeId, storage) {
    client.hDel(storage || 'nodes', nodeId);
}

function getAllNodes(storage) {
    return client.hGetAll(storage || 'nodes', (err, data) => {
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


function getFirstReadyNode(storage) {
    return client.hGetAll(storage || 'nodes', (err, data) => {
        if (err) throw err;
        if (data) {
            let nodes = Object.keys(data).map(key => ({
                nodeId: key,
                ...JSON.parse(data[key])
            })).filter(node => node.status === 'ready').at(0);
            if (!nodes) return undefined
            return nodes
        } else {
            return undefined
        }
    });
}


function deleteAllNodes() {
    client.flushAll()
}

module.exports = { client, addNode, updateNodeStatus, getNodeStatus, removeNode, getAllNodes, deleteAllNodes, getFirstReadyNode }