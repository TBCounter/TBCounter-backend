const mongoose = require('mongoose');

async function connect_storage() {
    console.log(process.env.MONGO_USER)
    console.log(process.env.MONGO_PASSWD)
    console.log(process.env.MONGO_URL)
    return mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@${process.env.MONGO_URL}`, { dbName: 'chests' })
}


const chestSchema = new mongoose.Schema({
    account_id: String,
    got_at: Date,
    status: String, // CREATED, UPLOADED, DOWNLOADED, PROCESSED, ERROR
    // OCR readed values
    name: String,
    type: String,
    source: String,
    time: Date,

    // s3 url
    url: String,
});


const Chest = mongoose.model('Chest', chestSchema);


module.exports = { mongoose, connect_storage, Chest }