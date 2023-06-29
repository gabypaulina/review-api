const express = require("express");
const app = express();

const router = require("./src/routes/router");

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/api", router);

const port = 3000;

app.listen(port, function () {
  console.log(`listening on port ${port}`);
});