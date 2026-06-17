import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();

app.get("/", (req, res) => {
  res.send("Server alive 🚀");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("room:create", () => {
    socket.emit("room:created", { code: "TEST123" });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("running on", PORT);
});
