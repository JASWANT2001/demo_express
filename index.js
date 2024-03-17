const express = require("express");
const cors = require("cors");
const { MongoClient, Long, ObjectId } = require("mongodb");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const URL = process.env.DB;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://sb-admin-beta.vercel.app", "http://localhost:3000"],
  })
);

function authorize(req, res, next) {
  if (req.headers.authorization) {
    try {
      const verify = jwt.verify(
        req.headers.authorization,
        process.env.SECRETKEY
      );
      if (verify) {
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

app.get("/employee", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const array = await db.collection("userdata").find().toArray();
    await connection.close();
    res.json(array);
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

app.post("/employee", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const obj = await db.collection("userdata").insertOne(req.body);
    await connection.close();
    res.json({ message: "User Inserted Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
});

app.get("/employee/:id", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const objectId = new ObjectId(req.params.id);
    const obj = await db.collection("userdata").findOne({ _id: objectId });
    connection.close();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong2" });
  }
});

app.put("/employee/:id", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const objid = new ObjectId(req.params.id);
    const obj = await db
      .collection("userdata")
      .findOneAndUpdate({ _id: objid }, { $set: req.body });
    await connection.close();
    res.json({ message: "Updated Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.delete("/employee/:id", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const objectid = new ObjectId(req.params.id);
    const objdelete = await db
      .collection("userdata")
      .deleteOne({ _id: objectid });
    await connection.close();
    res.json({ message: "User Deleted Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const newuser = await db.collection("admindata").insertOne(req.body);
    await connection.close();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const loginuser = await db
      .collection("admindata")
      .findOne({ email: req.body.email });
    // console.log(loginuser);
    if (loginuser) {
      const password = bcrypt.compareSync(
        req.body.password,
        loginuser.password
      );
      if (password) {
        const token = jwt.sign({ id: loginuser._id }, process.env.SECRETKEY);
        res.json({ message: "Login Success", token, loginuser });
      } else {
        res.status(401).json({ message: "Password Incorrect" });
      }
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Something went wrong" });
  }
});

app.post("/job", async (req, res) => {
  try {
    const connection = await MongoClient.connect("URL");
    const db = connection.db("sbadmin");
    const obj = await db.collection("jobdata").insertOne(req.body);
    await connection.close();
    res.json({ message: "Job Inserted Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
});

app.get("/job", async (req, res) => {
  try {
    const connection = await MongoClient.connect("URL");
    const db = connection.db("sbadmin");
    const objdata = await db.collection("jobdata").find().toArray(); // Fix: Added toArray() method
    await connection.close();
    res.json(objdata);
  } catch (error) {
    console.log(error); // Log the specific error
    res.status(404).json({ message: "Something Went Wrong" });
  }
});

app.listen(3005);

//kjaswant2305
//YlqxyAgMIaCIhFHk
