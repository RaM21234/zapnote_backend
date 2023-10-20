const express = require('express')
const router = express.Router()
const Events = require('../models/Events')
const fetchUser = require('../middleware/fetchUser')
const { body, validationResult } = require('express-validator');


// Route 1: get all events using GET: 'api/notes/fetchallevents' Login required
router.get('/fetchallevents', fetchUser, async (req, res) => {
    try {
        const events = await Events.find({ user: req.user.id })

        res.json(events)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})

// Route 2: Adding events using POST: 'api/events/addevent' Login required
router.post('/addevent', fetchUser, [body('name', 'name must be atleast 3 name').isLength({ min: 3 }), body('category', 'category must be atleast 3 character').isLength({ min: 3 }), body('description', 'description must be atleast 5 character').isLength({ min: 5 }), body('date', 'date must not be empty').notEmpty()], async (req, res) => {

// date must be in the format : mm/dd/yy

    try {
        const { name, category, date, description } = req.body

        //if there are errors return bad request and the errors 
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const event = new Events(
            {
                name, category, date, description, user: req.user.id
            })
        const savedEvent = await event.save()
        res.json(savedEvent)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})


// Route 3: Update an existing event using PUT: 'api/events/updateevent' Login required
router.put('/updateevent/:id', fetchUser, async (req, res) => {
    try {
        const { name, category, date, description } = req.body
        const newEvent = {}
        //Create  a new Event object
        if (name) { newEvent.name = name }

        if (description) { newEvent.description = description }

        if (category) { newEvent.category = category }

        if (date) { newEvent.date = date }

        //find the event to be updated and update it 
        let event = await Events.findById(req.params.id)
        if (!event) {
            return res.status(404).send('not found')
        }

        if (event.user.toString() !== req.user.id) {
            return res.status(401).send('not allowed')
        }

        event = await Events.findByIdAndUpdate(req.params.id, { $set: newEvent }, { new: true })
        res.json({ event })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})

// Route 4: delete an existing event using DELETE: 'api/events/deleteevent' Login required
router.delete('/deleteevent/:id', fetchUser, async (req, res) => {
    try {
        //find the note to be deleted and delete it 
        let event = await Events.findById(req.params.id)
        if (!event) {
            return res.status(404).send('not found')
        }
        // allow onlyif the user owns the note
        if (event.user.toString() !== req.user.id) {
            return res.status(401).send('not allowed')
        }

        event = await Events.findByIdAndDelete(req.params.id)
        res.json({ 'message': 'Successfully deleted', event: event })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})


module.exports = router