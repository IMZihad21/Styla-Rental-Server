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
        const stylaDB = client.db("stylaRental");

        // GET API
        app.get('/banner', async (req, res) => {
            const bannerIMG = stylaDB.collection('bannerIMG');
            const cursor = bannerIMG.find({});
            if ((await cursor.count()) === 0) {
                res.send([]);
            }
            else {
                const products = await cursor.toArray();
                res.json(products);
            }
        });

        app.get('/dresses', async (req, res) => {
            const dressesDB = stylaDB.collection('dresses');
            const cursor = dressesDB.find({});
            if ((await cursor.count()) === 0) {
                res.send([]);
            }
            else {
                const products = await cursor.toArray();
                res.json(products);
            }
        });

        // POST API
        app.post('/dresses', async (req, res) => {
            const dressesDB = stylaDB.collection('dresses');
            const data = req.body;
            const result = await dressesDB.insertOne(data);
            res.send(result);

        });
    }
    finally {
        console.log('Connection to MongoDB successfull');
    }
}

dbConnect();

app.get('/', (req, res) => {
    res.send('API for Styla Rental App is LIVE!')
});

app.listen(port, () => {
    console.log(`Styla Rental app listening at port: ${port}`)
});
