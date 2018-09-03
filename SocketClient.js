let express = require('express');
let app = express();
let net = require('net');
let path = require('path');

let value = ''; // valor captado desde el socket
let tmpData = '';
let client = new net.Socket();
function read(){

    client.connect(8080, '192.168.1.10', function () {
        console.log('Connected');
    });

    client.on('data', function (data) {
        //value = '';
        console.log((''+data).split(',').length);

        if(tmpData.split(',').length < 1001) {
            tmpData = tmpData + (''+data);
        }
        if(tmpData.split(',').length >=1001){
            console.log("resetando");
            value = tmpData;
            tmpData = '';
        }
    });
    //client.write('1');
} // funcion para leer el socket

app.listen(3001, function () {
    console.log('Example app listening on port 3000!');
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});
read();
app.get('/view', function (req, res) {

        let ds = value.split(",");
        let tmp = [];
        for(let i =0; i<ds.length; i++){
            if(ds[i]!==null && ds[i]!==undefined && ds[i]!==" ")
                tmp[i] = parseFloat(ds[i]);
        }
        res.json({ message: tmp });
});