const http = require('http');
const app = require('./app');
const server = http.createServer(app);

server.listen(3000, function () {
    console.log('listening on port 3000');
})