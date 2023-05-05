const express = require("express");
let app = express();
const cors = require("cors");
const { connection } = require("./config/db");
require("dotenv").config();

const { userrouter } = require("./routes/user.route");
const { postrouter } = require("./routes/post.route");

app.use(express.json());
app.use(express.text());
app.use(cors());

app.get('/', async(req,res) => {
  res.send('Yahooooo!!!');
});


//Socket.io
const { Server } = require('socket.io');
const io = new Server(8000, {
  cors: true
});
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
io.on('connection', (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on('room:join', (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(room).emit('user:joined', { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit('room:join', data);
  });

  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('incomming:call', { from: socket.id, offer });
  });

  socket.on('call:accepted', ({ to, ans }) => {
    io.to(to).emit('call:accepted', { from: socket.id, ans });
  });

  socket.on('peer:nego:needed', ({ to, offer }) => {
    io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
  });

  socket.on('peer:nego:done', ({ to, ans }) => {
    io.to(to).emit('peer:nego:final', { from: socket.id, ans });
  });
});
//socket.io end

app.use("/user", userrouter);
app.use("/post", postrouter);


app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("connected to the db");
  } catch (error) {
    console.log(error);
  }
  console.log(`server running on ${process.env.port} `);
});
