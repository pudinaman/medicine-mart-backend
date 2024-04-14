const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();

process.on('uncaughtException', async (err, data) => {
    try {
        console.log('Caught uncaught exception: ', err, data);
    } finally {
        process.exit(1);
    }
});

app.use(cors())
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the application." });
});

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}.`);
});