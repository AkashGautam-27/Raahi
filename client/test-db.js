const mongoose = require("mongoose");
const uri = "mongodb+srv://sdeakash27_db_user:bQnFVteRohQ4UVPL@cluster0.jeftktd.mongodb.net/Raahi";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
