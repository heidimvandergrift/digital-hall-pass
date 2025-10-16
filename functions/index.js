const functions = require("firebase-functions");

// This is the simplest possible function. It has no extra settings.
exports.directConnectionTest = functions.https.onRequest((req, res) => {
    res.send("It works!");
});