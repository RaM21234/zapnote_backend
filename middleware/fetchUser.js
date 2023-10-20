const jwt = require('jsonwebtoken');
const JWT_SECRET = '/$planner$/'

const fetchuser = (req, res, next) => {
    //Get the user from the token and add id to request body
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: 'use a valid token' })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user;
       

        next()

    } catch (error) {
        res.status(401).send({ error: 'use a valid token' })
    }
}

module.exports = fetchuser;