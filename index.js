const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { listen } = require('express/lib/application');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Connecting Mongo


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ae2mi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('inventory').collection('products');

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
            const { name, quantity, price, supplier, img, description } = req.body;
            const product = { name, quantity, price, supplier, img, description };
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
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("imanage Server is running");
})

app.listen(port, console.log("server is running on:", port));