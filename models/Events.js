const mongoose = require('mongoose')
const { Schema } = mongoose;

const EventsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
   
});

const Events = mongoose.model('events', EventsSchema);
// Notes.createIndexes() //helps in indexing of the data of DB  
module.exports = Events;