var io = require('socket.io')(require('http').createServer((req, res) => {
	require('fs').readFile('./client.html', (err, data) => {
		if (!err) {
			res.writeHead(200);
			res.end(data);
		} else
			res.end;
	});
}).listen(8080));
