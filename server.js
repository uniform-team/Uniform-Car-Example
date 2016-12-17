// Load Express framework
var express = require("express");
var app = express();

// Serve the www/ directory to clients
app.use(express.static("www"));

// On POST to /submit, validate the form
app.post("/submit", function (req, res) {
    res.end("I guess it's valid?");
});

// Listen on port 8000
app.listen(8000, function () {
    console.log("Started server. View it at http://localhost:8000");
});
