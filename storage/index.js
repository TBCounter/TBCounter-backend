const mongoose = require('mongoose');

async function connect_storage() {
    console.log(process.env.MONGO_USER)
    console.log(process.env.MONGO_PASSWD)
    console.log(process.env.MONGO_URL)
    return mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@${process.env.MONGO_URL}`, { dbName: 'chests' })
}


const chestSchema = new mongoose.Schema({
    account_id: String,
    session_id: String,
    got_at: Date,
    status: String, // CREATED, UPLOADED, PROCESSING, PROCESSED, ERROR
    // OCR readed values
    name: String,
    type: String,
    source: String,
    time: String,

    // s3 url
    url: String,
});

const sessionSchema = new mongoose.Schema({
    session_id: String,
    start_time: Date,
    end_time: Date,
    status: String, // ACTIVE, DONE, ERROR
    account_id: String,
    log: [
        {
            message: String,
            timestamp: { type: Date, default: Date.now },
        }
    ],
});


const Chest = mongoose.model('Chest', chestSchema);
const Session = mongoose.model('Session', sessionSchema);


module.exports = { mongoose, connect_storage, Chest, Session }