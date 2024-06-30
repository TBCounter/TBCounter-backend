const mongoose = require('mongoose');



async function connect_storage() {
    console.log(process.env.MONGO_USER)
    console.log(process.env.MONGO_PASSWD)
    console.log(process.env.MONGO_URL)
    return mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@${process.env.MONGO_URL}`)
}


const chestSchema = new mongoose.Schema({
    name: String
});


const Chest = mongoose.model('Chest', chestSchema);


module.exports = { mongoose, connect_storage, Chest }