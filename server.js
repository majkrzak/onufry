#!/usr/bin/env node

orders = [];

/*
	{
		title: 'adasda',
		maker: 'Piotr Majkrzak',
		description: 'adiasda \n aisjdfaijd\n',
		
	}

*/

const key = require('fs').readFileSync('./pub.pem');
const client = require('fs').readFileSync('./client.html');

var io = require('socket.io')(require('http').createServer((req, res) => {
	res.writeHead(200);
	res.end(client);
}).listen(8080));

io.use((socket, next) => {
	require('jsonwebtoken').verify(socket.handshake.query.token, key, function(err, decoded) {
		if (!err) {
			socket.user = decoded;
			return next();
		} else
			return next(new Error('authentication error'));
	});
});
