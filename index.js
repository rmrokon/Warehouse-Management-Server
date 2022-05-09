const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { listen } = require('express/lib/application');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsConfig = {
    origin: true,
    credentials: true,
}
app.use(cors(corsConfig))
app.options('*', cors(corsConfig))
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.send(401).send({ message: "Unauthorized Access" });
    }
    next();
}


// Connecting Mongo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ae2mi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('inventory').collection('products');
        const orderCollection = client.db('orders').collection('order');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '30d'
            });
            res.send({ accessToken });
        })

        // Get all products API
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // Get Product by id API

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        // Update Product API

        app.put('/updateProduct/:id', async (req, res) => {
            const updatedProduct = req.body;
            // const updatedQuantity = req.body;
            console.log(updatedProduct);
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateProduct = {
                $set: {
                    quantity: updatedProduct.currentQuantity
                },
            };

            const result = await productCollection.updateOne(query, updateProduct, options);
            console.log(result);

            res.send(result);

        })

        // Add New Product API

        app.post('/addnewproduct', async (req, res) => {
            const { name, email, quantity, price, supplier, img, description } = req.body;
            const product = { name, email, quantity, price, supplier, img, description };
            const addProduct = await productCollection.insertOne(product);

            res.send(addProduct);
        })

        // Delete Product API
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteProduct = await productCollection.deleteOne(query);
            if (deleteProduct.deletedCount === 1) {
                console.log("Product Deleted")
            }
        })

        // Add order API
        app.post('/addorder', async (req, res) => {
            const { clientName, productName, quantity } = req.body;
            const newOrder = { clientName, productName, quantity };
            const addOrder = await orderCollection.insertOne(newOrder);
            res.send(addOrder);

        })

        // Get Orders API
        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // Get Products by email API

        app.get('/getProductsByEmail', verifyJWT, async (req, res) => {

            const email = req.query.email;
            const query = { email: email }
            const cursor = productCollection.find(query);
            const productsByEmail = await cursor.toArray();
            res.send(productsByEmail)
        })

        // Get Order by ID
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteOrder = await orderCollection.deleteOne(query);
            if (deleteOrder.deletedCount === 1) {
                console.log("Product Deleted")
            }
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("imanage Server is running");
})

app.listen(port, console.log("server is running on:", port));