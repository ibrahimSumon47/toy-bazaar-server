const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const forReactTabs = client.db("toyBazaar").collection("reactTabs")

    // For React Tabs

    app.get("/reactTabs", async(req, res) => {
      const reactTabs = await forReactTabs.find().toArray();
      res.send(reactTabs)
    })

    // All Toys
    app.get("/allToys", async(req, res) => {
      console.log(req.query.email);
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const limit = parseInt(req.query.limit) || 20;
      const toys = await allToysCollection.find(query).limit(limit).toArray();
      res.send(toys)
    })


    app.post("/allToys", async (req, res) => {
      const toys = req.body;
      console.log(toys);
      const toysArray = await allToysCollection.insertOne(toys);
      res.send(toysArray);
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
