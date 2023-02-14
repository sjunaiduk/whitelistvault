const bodyParser = require("body-parser");
const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = 3000;

const pinksaleRouter = require("./Whitelistchecker/pinksale/whitelistChecker");

app.use("/pinksale", pinksaleRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
