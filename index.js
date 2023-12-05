const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middlewires
const corsConfig = {
  origin: [
    'http://localhost:5173',
    'https://assignment-11-marketplace.web.app',
    'https://assignment-11-marketplace.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use(express.json());
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ij3feyg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// // middlewares
// const logger = ( req,res,next) => {
//   console.log(req?.method, req?.url);
//   next()
// }

// const verifyToken = (req,res,next) => {
//   const token = req?.cookies?.token;
//   console.log('tkn in midl', token);
//   next()
// }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCollection = client.db('marketplace').collection('jobs')
    const bidJobCollection = client.db('marketplace').collection('bidJobs')
    // const usersCollection = client.db('marketplace').collection('users')


    // jwt api
    app.post('/jwt', async(req,res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"})

      res
      .cookie('token', token, {
        httpOnly: true,
        secure: false,
        // maxAge: 
        sameSite: 'none'
      })
      .send({success: true})
    })

    app.post('/logout', async(req,res) =>{
      const user = req.body;
      console.log('login out', user);
      res.clearCookie('token', {maxAge:0}).send({success:true})
    })

    
    

    // services api
    app.get('/jobs', async (req, res) => {

      // console.log("job tokrnnn", req.cookies.token);

      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category }
      } else if (req.query?.employer_email) {
        query = {
          employer_email: req.query.employer_email
        }
      }

      const result = await jobCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result)
    })

    app.get('/bidJobs',  async (req, res) => {
      // console.log("bid tokrnnn", req.cookies.token);

      let query = {}
      if (req.query?.bidderEmail) {
        query = { bidderEmail: req.query.bidderEmail }
      } else if (req.query?.employerEmail) {
        query = { employerEmail: req.query.employerEmail }
      }
      const result = await bidJobCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/add-job',  async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await jobCollection.insertOne(newJob)
      res.send(result)
    })

    app.post('/bid-job',  async (req, res) => {
      const newBid = req.body;
      console.log(newBid);
      const result = await bidJobCollection.insertOne(newBid)
      res.send(result)
    })

    app.put('/bid_req/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedStatus = req.body;
      const status = {
        $set: {
          status: updatedStatus.status,
        }
      }
      const result = await bidJobCollection.updateOne(filter, status, options);
      res.send(result);
    })

    app.put('/complete_job/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateJob = req.body;
      const job = {
        $set: {
          status: updateJob.status,


        }
      }
      const result = await bidJobCollection.updateOne(filter, job, options);
      res.send(result);
    })

    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJob = req.body;
      const job = {
        $set: {
          job_title: updatedJob.job_title,
          category: updatedJob.category,
          deadline: updatedJob.deadline,
          min_price: updatedJob.min_price,
          max_price: updatedJob.max_price,
          description: updatedJob.description,
        }
      }

      app.delete('/jobs/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await jobCollection.deleteOne(query)
        res.send(result);
      })

      const result = await jobCollection.updateOne(filter, job, options)
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
  res.send('server runningggg')
})

app.listen(port, () => {
  console.log(`site server running port ${port}`);
})