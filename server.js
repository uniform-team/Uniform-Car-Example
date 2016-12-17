// Load Express framework
var express = require("express");
var app = express();

// Load Uniform
var validator = require("uniform-validation");

// Serve the www/ directory to clients
app.use(express.static("www"));

// On POST to /submit, validate with Uniform
app.post("/submit", validator("www/car.ufm"), function (req, res) {
    res.end("Valid :)");
}, function (err, req, res, next) {
    res.end("Invalid :(");
    console.error(err);
});

// Listen on port 8000
app.listen(8000, function () {
    console.log("Started server. View it at http://localhost:8000");
});
