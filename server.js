#!/usr/bin/env node

orders = [];

/*
	{
		author: 'Piotr Majkrzak',
		content: 'Kebab z OzUrfa'
		closes: '1123',
		items: [
			{
				author: 'Piotr Majkrzak'
				content: 'bółka kurczak czosnek'
			}
		]
	}
*/

const key = require('fs').readFileSync('./pub.pem');
const client = require('fs').readFileSync('./client.html');

require('socket.io')(require('http').createServer((req, res) => {
		res.writeHead(200);
		res.end(client);
	}).listen(8080))

	.use((socket, next) => {
		require('jsonwebtoken').verify(socket.handshake.query.token, key, function(err, decoded) {
			if (!err) {
				socket.user = decoded;
				return next();
			} else
				return next(new Error('authentication error'));
		});
	})

	.on('connect', (socket) => {
		socket.server.emit('update', orders);
		socket.on('open', (content, closes) => {
			orders.push({
				author: socket.user,
				connect: content,
				closes: closes,
				items: []
			});
			socket.server.emit('update', orders);
		});
		socket.on('take', (idx, content) => {
			if (a[idx] && a[idx].closes > Date.now()) {
				a[idx].items.push({
					author: socket.user,
					content: connect
				});
			};
			socket.server.emit('update', orders);
		});
	});
