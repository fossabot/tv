const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {origins: '*:*'});
const port = process.env.port || 3001;

app.get('/', (req, res) => {
  res.sendFile('../public/index.html', {root: __dirname});
});

io.on('connection', (client) => {
  console.log('connected to socket');

  const printRes = (err) => {
    const msg = err ?
      `createRoom ran into an error: ${err}` :
      `Room has been created.`;
    console.log(msg);
  };

  client.on('initTv', (err) => {
    // TODO come up with a better way to get a random name
    const randomName = client.id.slice(0,4);
    io.emit('handshake', randomName);
  });

  client.on('joinRoom', (roomId) => {
    client.join(roomId, (err) => {
      printRes(err);
    });

    io.to(roomId).emit('test', `joined room ${roomId}`);
  });

  client.on('command', (room, cmd) => {
    io.to(room).emit('command', cmd);
  });

  client.on('disconnect', function() {
    console.log('client disconnect...', client.id);
  });

  client.on('error', function(err) {
    console.log('received error from client:', client.id)
    console.log(err);
  });
});

http.listen(port, function(err) {
  if (err) throw err;
  console.log(`listening on ${port}`);
});