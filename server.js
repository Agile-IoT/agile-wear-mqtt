const mosca     = require('mosca');

var mosca_settings = {
    port: 1883
};

var server = new mosca.Server(mosca_settings);

server.on('ready', function () {
    console.log('server ready');
});

server.on('published', function(packet, client) {
    console.log(packet.payload);
});