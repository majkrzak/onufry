#!/usr/bin/env node

/*
	{
		date: 1234,
		author: 'Piotr Majkrzak',
		content: 'Kebab z OzUrfa'
		closes: 1123,
		items: [
			{
				date: 1234,
				author: 'Piotr Majkrzak'
				content: 'bółka kurczak czosnek'
			}
		]
	}
*/

const key = process.env.KEY || "";
const port = process.env.PORT || 8080;
const client = require('fs').readFileSync('./client.html');

var orders = [];
var stats = {
	started: Date.now(),
	clients: 0,
};

require('socket.io')(require('http').createServer((req, res) => {
		if (req.url == '/') {
			res.writeHead(200);
			res.end(client);
		} else {
			res.writeHead(404);
			res.end();
		}
	}).listen(port))

	.use((socket, next) => {
		require('jsonwebtoken').verify(socket.handshake.query.token, key, function(err, decoded) {
			if (!err) {
				socket.user = decoded;
				return next();
			} else
				return next(new Error('authentication error'));
		});
	})

	.use((socket, next) => {
		socket.update = () => {
			socket.server.emit('update', orders, stats)
		};
		next();
	})

	.on('connect', (socket) => {
		stats.clients += 1;
		socket.update();
		socket.on('open', (content, closes) => {
			orders.push({
				author: socket.user,
				content: content,
				closes: closes,
				items: []
			});
			socket.update();
		});
		socket.on('close', (idx) => {
			if (orders[idx] && orders[idx].author == socket.user) {
				delete orders[idx];
				socket.update();
			}
		});
		socket.on('take', (idx, content) => {
			if (orders[idx] && orders[idx].closes > Date.now()) {
				orders[idx].items.push({
					author: socket.user,
					content: content
				});
				socket.update();
			};
		});
		socket.on('drop', (idx, jdx) => {
			if (orders[idx] && orders[idx].items[jdx] && orders[idx].items[jdx] == socket.user) {
				delete orders[idx].items[jdx];
				socket.update();
			}
		});
		socket.on('stop', (idx) => {
			if (orders[idx] && orders[idx].author == socket.user) {
				orders[idx].closes = 0;
				socket.update();
			}
		});
		socket.on('disconnect', () => {
			stats.clients -= 1;
			socket.update();
		});
	});
