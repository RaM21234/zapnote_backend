const mongoose = require('mongoose');

const URI=`mongodb+srv://ramkumaravs01:hayGYUGhUjv9RW6v@cluster0.fubjfbw.mongodb.net/planner`


async function connectToMongoose() {
    try {
      await mongoose.connect(URI);
      console.log(`Connected to MongoDB`);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

module.exports =connectToMongoose;
