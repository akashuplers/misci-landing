// wiki.js - Wiki route module.

const express = require("express");
const router = express.Router();

// Home page route.
router.get("/", function (req: any, res: any) {
  res.send("Wiki home page");
});

module.exports = router;
