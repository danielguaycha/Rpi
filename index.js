let express = require('express');
let app = express();
let path = require('path');
let net = require('net');
let client = new net.Socket();
client.autoClose = false;
client.closed = false;
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// sockets


// webservices
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

// getters
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

client.connect(12346, '127.0.0.1', function () {
    console.log('Connected');
});

function getValues() {
    client.on('data', function (data) {
        console.log('DATA: ' + data);
    });
    client.on('close', function () {
        console.log('Connection closed');
    });
}
getValues();
