let express = require('express');
let app = express();
let mqtt = require('mqtt')
let client  = mqtt.connect('mqtt://192.168.1.10');
let path = require('path');
let url = require('url');


let value = '';
let status = '';
let default_config = {
    change_contactor: false,
    change_canal : false,
    contactor: '',
    canal: '2',
    multiplex: '0',
    change_multiplex: false,
    n_medidas: 500,
    vel_data: 1200000
};

client.on('connect', function () {
    client.subscribe('/iotmach/lecturas/');
    client.subscribe('/iotmach/estado/');
});

function read(){
    value = '';
    status = '';
    client.on('message', function (topic, message) {
        //console.log(message.toString());
        if(topic.toString() === "/iotmach/lecturas/") {
            value = JSON.parse(message.toString());
        }
        //console.log(value.split(",").length);
        //client.end()
    });
}

app.listen(3001, function () {
    console.log('Example app listening on port 3000!');
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/control.html'));
});

app.get('/lecturas', function (req, res) {

    let url_parts = url.parse(req.url,true);

    default_config['canal'] = url_parts.query.q;
    default_config['change_canal'] = true;
    default_config['change_contactor'] = false;

    default_config['multiplex'] = (url_parts.query.m === undefined)?'0':url_parts.query.m;
    default_config['change_multiplex'] = (url_parts.query.m !== undefined && parseInt(url_parts.query.m)<=16 && parseInt(url_parts.query.m)>=0 );

    client.publish("/iotmach/contactor/", JSON.stringify(default_config));

    res.sendFile(path.join(__dirname, '/public/lectura.html'));
});


read();

app.get('/view', function (req, res) {

    let data = {
        corriente : (value.corriente!==undefined)?parseToFloat(value.corriente.split(",")): '',
        voltaje: (value.voltaje!==undefined)?parseToFloat(value.voltaje.split(",")): '',
        potencia: (value.potencia!==undefined)?parseToFloat(value.potencia.split(",")): null,
        factor_potencia: [],
    };

    //let c = value.corriente.split(",");
    //let v = value.voltaje.split(",");
    //let p = value.potencia.split(",");
    //let fp = value.factor_potencia.split(",");

    res.json({ message: data });
});

function parseToFloat(arr){
    let tmp = [];
    for (let i =0; i< arr.length; i++){
        if(arr[i]!==null && arr[i]!==undefined && arr[i]!==" ")
            tmp[i] = parseFloat(arr[i]);
    }
    return tmp
}

app.get('/status', function (req, res) {
    res.json(value.contactores)
});

app.get("/contactor", function (req, res) {
    let url_parts = url.parse(req.url,true);
    default_config['contactor'] = url_parts.query.c;
    default_config['change_contactor'] = true;
    default_config['change_canal'] = false;

    client.publish("/iotmach/contactor/", JSON.stringify(default_config));
    res.json(default_config);
});

app.use('/public', express.static(__dirname + '/public'));
