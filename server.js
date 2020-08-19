const express = require("express");
const app = express();

let broadcaster;
let broadcasters = [];
const port = process.env.PORT || 3000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", (roomid) => {
    broadcaster = socket.id;
    broadcasters[roomid] = socket.id;
    // socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", (roomid) => {
    socket.to(broadcasters[roomid]).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });

  socket.on("end", (roomid) => {
    socket.to(broadcasters[roomid]).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
