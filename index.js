const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ij3feyg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCollection = client.db('marketplace').collection('jobs')
    const bidJobCollection = client.db('marketplace').collection('bidJobs')

    // app.get('/jobs', async (req,res) => {

    //   console.log(req.query.email);
    //   let query = {};
    //   if (req.query?.email) {
    //     query = { email: req.query.email}
    //   }

    //   const result = await jobCollection.find(query).toArray();
    //   res.send(result)
    // })
    
    app.get('/jobs', async (req, res) => {
      
      let query = {};
      if (req.query?.category) {
        query = {category: req.query.category}
      } else if (req.query?.email) {
        query = { email: req.query.email}
      }
      
      const result = await jobCollection.find(query).toArray();
      res.send(result)
    })
    
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.findOne(query);
      res.send(result)
    })

    app.post('/add-job', async(req,res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await jobCollection.insertOne(newJob)
      res.send(result)
    })

    app.post('/bid-job', async(req,res) => {
      const newBid = req.body;
      console.log(newBid);
      const result = await bidJobCollection.insertOne(newBid)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server running')
})

app.listen(port, () => {
  console.log(`site server running port ${port}`);
})