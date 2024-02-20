const express = require("express");
const cors = require("cors");
const { MongoClient, Long, ObjectId } = require("mongodb");
const URL = "mongodb://localhost:27017";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", async (req, res) => {
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

app.post("/", async (req, res) => {
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

app.get("/:id", async (req, res) => {
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

app.put("/:id", async (req, res) => {
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

app.delete("/:id", async (req, res) => {
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

app.listen(3005);
