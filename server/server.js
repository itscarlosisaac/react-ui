const express = require('express');
const app = express();
const path = require('path')

const distPath = path.join(__dirname, "..", "dist/");
const port = process.env.PORT || 3000;

app.use( express.static(distPath) );

// Start Server

app.all( '*', (req, res) => {
 res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, (req, res) => {
 console.log("Server is up");
})