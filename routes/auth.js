const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = '/$planner$/'
const fetchUser = require('../middleware/fetchUser')

//Route 1: Create a user using POST :"/api/auth/createuser".Doesn't require auth 
router.post('/createuser', [body('name', 'enter a valid name').isLength({ min: 3 }),
body('email', 'enter a valid email').isEmail(),
body('password', 'password must be atleast 5 character').isLength({ min: 5 })], async (req, res) => {
    let success = false
    //if there are errors return bad request and the errors 
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ success, error: error.array() });
    }
    try {
        //checking whether the user exists or not 

        let user = await User.findOne({ email: req.body.email })

        if (user) {
            return res.status(400).json({ success, error: 'user with this email already exists' })
        }
        //creating a new user after findin none in db
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user: {
                id: user.id,
                name: req.body.name,
            email: req.body.email
            }
        }
        const token = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({ success, token })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Some error occured')
    }
})
//***************************************************************************************************************************** */
// the process of the create user is in steps:
// 1 create a post http request
// 2 then using the post request get the relevant information from the user
// 3 using the relevant information save the data in mongo db 
// 4 now after that use express validator to prevent wrong data being given to the mongo db model thus preventing the server from crashing 
// us a try catch syntax to handle unnecessary errors (db related)
// 5 to prevent the duplicate data from being passed to the db check by finding the input data first in db then registering it.
// 6 using the bcrypt create the secured password then create a hash then store the hash
// 7 using jsonwebtoken using a unique identification of the data create a authtoken using it and also using a jwt secret ,then give back the user the token in the form of cookies 
//***************************************************************************************************************************** */

// Route 2: authenticate a user using  POST "/api/auth/login" No login required
router.post('/login', [body('email', 'enter a valid email').isEmail(),
body('password', 'password must not be empty').notEmpty()],
    async (req, res) => {
        let success = false
        //if there are errors return bad request and the errors 
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() });
        }
        const { email, password } = req.body
        try {
            let user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({ success, error: 'enter correct credentials' })
            }
            const passwordcompare = await bcrypt.compare(password, user.password)
            if (!passwordcompare) {
                return res.status(400).json({ success, error: 'enter correct credentials' })
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, JWT_SECRET);
            success = true
            res.json({ success, token })


        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal server error')
        }

    })

// Route 3:Get logged in user details using: POST "/api/auth/getuser" Login required 
router.post('/getuser', fetchUser, [body('email', 'enter a valid email').isEmail(),
body('password', 'password must not be empty').notEmpty()],
    async (req, res) => {
        try {
            const userid = req.user.id
            const user = await User.findById(userid).select(['-password', '-date'])
            console.log(user)
            res.send(user)
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal server error')
        }
    })


module.exports = router