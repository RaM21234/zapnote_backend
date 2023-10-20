const mongoose = require('mongoose')
const { Schema } = mongoose;

const TodoSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    task: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    }
});

const Todo = mongoose.model('todo', TodoSchema);
// Notes.createIndexes() //helps in indexing of the data of DB  
module.exports = Todo;