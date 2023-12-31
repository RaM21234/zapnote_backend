const express = require('express')
const router = express.Router()
const Notes = require('../models/Notes')
const fetchUser = require('../middleware/fetchUser')
const { body, validationResult } = require('express-validator');

// Route 1: get all notes using GET: 'api/notes/fetchallnotes' Login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })

        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})

// Route 2: Adding notes using POST: 'api/notes/addnote' Login required
router.post('/addnote', fetchUser, [body('title', 'enter a valid title').isLength({ min: 3 }),
body('description', 'description must be atleast 5 character').isLength({ min: 5 })], async (req, res) => {

    try {
        const { title, description, tag } = req.body

        //if there are errors return bad request and the errors 
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }

        const note = new Notes(
            {
                title, description, tag, user: req.user.id
            })
        const savedNote = await note.save()
        res.json(savedNote)

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})

// Route 3: Update an existing note using PUT: 'api/notes/updatenote' Login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try {
        const { title, description, tag } = req.body
        const newNote = {}
        //Crete  anew Note object
        if (title) { newNote.title = title }

        if (description) { newNote.description = description }

        if (tag) { newNote.tag = tag }

        //find the note to be updated and update it 
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).send('not found')
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('not allowed')
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})


// Route 4: delete an existing note using DELETE: 'api/notes/deletenote' Login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        //find the note to be deleted and delete it 
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).send('not found')
        }
        // allow onlyif the user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('not allowed')
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ 'message': 'Successfully deleted', note: note })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})


module.exports = router