const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// those ar app and port variable
const app = express();
const port = process.env.PORT || 5000;

// user middleware here
app.use(cors());
app.use(cookieParser());
app.use(express.json());

//this is service api start from here

app.get("/", (req, res) => {
  res.send("this is MadeCare website server.");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster2.vcbrqie.mongodb.net/?retryWrites=true&w=majority`;

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

    const madeCare = client.db("madeCare");
    const services = madeCare.collection("service");
    const faq = madeCare.collection("faq");
    const appointment = madeCare.collection("appointment");
    const patientAppointment = madeCare.collection("patientAppointment");
    const subscribe = madeCare.collection("subscribe");

    // this is auth related api

    // app.post("/jwt", async (req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "1h",
    //   });
    //   res
    //     .cookie("token", token, {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    // });

    // this is service related api

    app.get("/services", async (req, res) => {
      const getService = services.find();
      const result = await getService.toArray();
      res.send(result);
    });

    app.get("/faq", async (req, res) => {
      const getFaq = faq.find();
      const result = await getFaq.toArray();
      res.send(result);
    });

    app.get("/appointment", async (req, res) => {
      const result = await appointment.find().toArray();
      res.send(result);
    });

    app.post("/appointment", async (req, res) => {
      const appointment = req.body;
      console.log(appointment);
      const result = await patientAppointment.insertOne(appointment);
      res.send(result);
    });

    app.get("/my-appointment", async (req, res) => {
      let query = {};
      if (req?.query?.email) {
        query = { email: req?.query.email };
      }
      const result = await patientAppointment.find(query).toArray();
      res.send(result);
      console.log(query);
    });

    // this is appointment delete operation

    app.delete("/my-appointment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await patientAppointment.deleteOne(query);
      res.send(result);
    });
    app.get("/my-appointment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await patientAppointment.findOne(query);
      console.log(result);
      res.send(result);
    });

    // this is appointment update operation
    app.put("/my-appointment/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const UpdateData = {
        $set: {
          patient_name: data.patient_name,
          email: data.email,
          patient_address: data.patient_address,
          department: data.department,
          doctor: data.doctor,
          date: data.date,
          time: data.time,
          age: data.age,
        },
      };
      const result = await patientAppointment.updateOne(
        filter,
        UpdateData,
        options
      );
      res.send(result);
    });

    // this is subscribe email post data handle

    app.post("/subscribe", async (req, res) => {
      const email = req.body;
      const result = await subscribe.insertOne(email);
      res.send(result);
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

app.listen(port, () => {
  console.log("this port is running at port", port);
});
