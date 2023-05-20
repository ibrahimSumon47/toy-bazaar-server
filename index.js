const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.92d2eha.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allToysCollection = client.db("toyBazaar").collection("allToys");
    const forReactTabs = client.db("toyBazaar").collection("reactTabs");

    // For React Tabs
    app.get("/reactTabs", async (req, res) => {
      const reactTabs = forReactTabs.find();
      const result = await reactTabs.toArray();
      res.send(result);
    });

    app.get("/reactTabs/:id", async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await forReactTabs.findOne(query);
      res.send(result);
    });

    // All Toys
    app.get("/allToys", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const limit = parseInt(req.query.limit) || 20;
      const toys = await allToysCollection.find(query).limit(limit).toArray();
      res.send(toys);
    });

    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toys = await allToysCollection.find(query).toArray();
      res.send(toys);
    });

    // app.put("/allToys/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updatedToy = req.body;
    //   console.log(updatedToy);
    //   const updateToy = {
    //     $set: {
    //       status: updatedToy.status,
    //     },
    //   };
    //   const result = await allToysCollection.updateOne(filter, updateToy);
    //   res.send(result);
    // });

    app.delete("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toys = await allToysCollection.deleteOne(query);
      res.send(toys);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ToyBazaar is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
