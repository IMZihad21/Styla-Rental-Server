const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;

// Initialize App
const app = express();
dotenv.config();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Read from ENV
const port = process.env.PORT || 9000;
const uri = process.env.MONGODB_URI;

// Connection to MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnect = async () => {
    try {
        await client.connect();
        const stylaRentals = client.db("stylaRental");
        const dressesDB = stylaRentals.collection('dresses');
        const cartDB = stylaRentals.collection('cart');

        // GET API
        app.get('/dresses', async (req, res) => {
            const cursor = dressesDB.find({});
            if ((await cursor.count()) === 0) {
                res.send([]);
            }
            else {
                const products = await cursor.toArray();
                res.json(products);
            }
        });

        app.get('/cart/all', async (req, res) => {
            const cursor = cartDB.find({});
            if ((await cursor.count()) === 0) {
                res.send([]);
            }
            else {
                const products = await cursor.toArray();
                res.json(products);
            }
        });

        app.get('/dress/:dressID', async (req, res) => {
            const dressID = req.params.dressID;
            const query = { _id: ObjectId(dressID) };
            const dress = await dressesDB.findOne(query);
            res.json(dress);
        });

        app.get('/cart/:userID', async (req, res) => {
            const userID = req.params.userID;
            const query = { userID };
            const data = await cartDB.findOne(query);
            if (data) {
                res.json(data);
            }
            else {
                res.json([])
            }
        });

        // POST API
        app.post('/dresses', async (req, res) => {
            const result = await dressesDB.insertOne(req.body);
            res.send(result);
        });

        // PUT API
        app.put('/cart', async (req, res) => {
            const { userID, cart, order } = req.body;
            const filter = { userID: userID };
            const options = { upsert: true };
            const updateDoc = { $set: { cart, order } };
            const result = await cartDB.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.put('/order', async (req, res) => {
            const { userID, productID } = req.body;
            const { order } = await cartDB.findOne({ userID });
            const updatedOrder = order.filter(element => element._id !== productID);
            const filter = { userID: userID };
            const updateDoc = { $set: { order: updatedOrder } };
            const result = await cartDB.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.put('/order/authorize', async (req, res) => {
            const { userID, _id } = req.body;
            const { order } = await cartDB.findOne({ userID });
            const updatedOrder = order.map(obj =>
                obj._id === _id ? { ...obj, pending: false } : obj
            );
            const filter = { userID: userID };
            const updateDoc = { $set: { order: updatedOrder } };
            const result = await cartDB.updateOne(filter, updateDoc);
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
