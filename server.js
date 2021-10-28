const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;

// Initialize App
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Read from ENV
const port = process.env.PORT || 9000;
const uri = process.env.MONGODB_URI;

// Connection to MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnect = async () => {
    try {
        await client.connect();
    }
    finally {
        console.log('Connection to MongoDB successfull');
    }
}

app.get('/', (req, res) => {
    res.send('API for Styla Rental App is LIVE!')
});

app.listen(port, () => {
    console.log(`Styla Rental app listening at port: ${port}`)
});
