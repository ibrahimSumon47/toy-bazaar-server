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
    // const myAddedToys = client.db("toyBazaar").collection("myToys");
    const forReactTabs = client.db("toyBazaar").collection("reactTabs");

    // For React Tabs
    app.get("/reactTabs", async (req, res) => {
      const reactTabs = forReactTabs.find();
      const result = await reactTabs.toArray();
      res.send(result);
    });

    app.get("/reactTabs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await forReactTabs.findOne(query);
      res.send(result);
    });

    // All Toys
    app.get("/allToys", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const toys = await allToysCollection.find().limit(limit).toArray();
      res.send(toys);
    });

    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toys = await allToysCollection.find(query).toArray();
      res.send(toys);
    });

    // Sort

    app.get("/sortToys", async (req, res) => {
      let query = {};
      if (req.query?.toyName) {
        query = { email: req.query.toyName };
      }
      const sort = req.query?.sort === "asc" ? 1 : -1;
      const sortToy = "price";
    
      const result = await allToysCollection
        .find(query)
        .limit(20)
        .sort({ [sortToy]: sort })
        .toArray();
      res.send(result);
    });
    

    // Add A Toy to all data
    app.post("/allToys", async (req, res) => {
      const allToys = req.body;
      const result = await allToysCollection.insertOne(allToys);
      res.send(result);
    });

    // update toy data
    app.put("/toyUpdateData/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      console.log(updatedToy, id);
      const updateToy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          details: updatedToy.details,
        },
      };
      const result = await allToysCollection.updateOne(
        filter,
        updateToy,
        options
      );
      res.send(result);
    });

    // search
    app.get("/allToysSearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await allToysCollection
        .find({
          $or: [
            { toyName: { $regex: text, $options: "i" } },
            { category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    // email
    app.get("/allToysEmail/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await allToysCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // Delete everywhere
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
