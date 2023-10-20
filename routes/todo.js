const express = require('express')
const router = express.Router()
const Todo = require('../models/Todo')
const fetchUser = require('../middleware/fetchUser')
const { body, validationResult } = require('express-validator');


// Route 1: get all events using GET: 'api/notes/fetchalltodo' Login required
router.get('/fetchalltodo', fetchUser, async (req, res) => {
    try {
        const todo = await Todo.find({ user: req.user.id })

        res.json(todo)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})

// Route 2: Adding events using POST: 'api/todo/addtodo' Login required
router.post('/addtodo', fetchUser, [body('task', 'task must be atleast 3 task').isLength({ min: 3 }), body('description', 'description must be atleast 5 character').isLength({ min: 5 }), body('deadline', 'deadline must not be empty').notEmpty()], async (req, res) => {

    // date must be in the format : mm/dd/yy

    try {
        const { task, deadline, description } = req.body

        //if there are errors return bad request and the errors 
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const todo = new Todo(
            {
                task, deadline, description, user: req.user.id
            })
        const savedTodo = await todo.save()
        res.json(savedTodo)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})


// Route 3: Update an existing todo using PUT: 'api/todo/updatetodo' Login required
router.put('/updatetodo/:id', fetchUser, async (req, res) => {
    try {
        const { task, deadline, description } = req.body
        const newTodo = {}
        //Create  a new Event object
      
        if (description) { newTodo.description = description }

        if (task) { newTodo.task = task }

        if (deadline) { newTodo.deadline = deadline }

        //find the event to be updated and update it 
        let todo = await Todo.findById(req.params.id)
        if (!todo) {
            return res.status(404).send('not found')
        }

        if (todo.user.toString() !== req.user.id) {
            return res.status(401).send('not allowed')
        }

        todo = await Todo.findByIdAndUpdate(req.params.id, { $set: newTodo }, { new: true })
        res.json({ todo })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})

// Route 4: delete an existing todo using DELETE: 'api/todo/deletetodo' Login required
router.delete('/deletetodo/:id', fetchUser, async (req, res) => {
    try {
        //find the note to be deleted and delete it 
        let todo = await Todo.findById(req.params.id)
        if (!todo) {
            return res.status(404).send('not found')
        }
        // allow onlyif the user owns the note
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).send('not allowed')
        }

        todo = await Todo.findByIdAndDelete(req.params.id)
        res.json({ 'message': 'Successfully deleted', todo: todo })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})


module.exports = router