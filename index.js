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

app.get("/", authorize, async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const array = await db.collection("userdata").find().toArray();
    await connection.close();
    res.json(array);
  } catch (error) {
    res.status(500).json("Something went wrong");
  }
});

app.post("/", authorize, async (req, res) => {
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

app.get("/:id", authorize, async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("sbadmin");
    const objectId = new ObjectId(req.params.id);
    const obj = await db.collection("userdata").findOne({ _id: objectId });
    connection.close();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.put("/:id", authorize, async (req, res) => {
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

app.delete("/:id", authorize, async (req, res) => {
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
    if (loginuser) {
      const password = bcrypt.compareSync(
        req.body.password,
        loginuser.password
      );
      if (password) {
        const token = jwt.sign({ id: loginuser._id }, process.env.SECRETKEY);
        res.json({ message: "Login Success", token });
      } else {
        res.status(500).json({ message: "Password Incorrect" });
      }
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status.json({ message: "Something went wrong" });
  }
});

app.listen(3005);

//kjaswant2305
//YlqxyAgMIaCIhFHk
