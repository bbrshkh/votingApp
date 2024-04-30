const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db');
// const Candidate = require('./models/candidate')

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3001;

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

const candidateRoutes = require('./routes/candidateRoute');
app.use('/candidate', candidateRoutes);

app.listen(PORT, ()=> {
    console.log(`Server running at localHost:`, PORT)
})

// check = async() => {
//     const user = await Candidate.findByIdAndUpdate('66261e28d70185f48099e7d3', {name: 'babar'});
//     console.log(user);  
// }

// check();