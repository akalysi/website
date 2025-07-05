/* AKALYSI: THE WEBSITE */
/* init */

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import sqlite3pkg from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profanityFilter = new Filter();

const app = express();
const PORT = 3000;

const server = http.createServer(app);
const io = new Server(server);

const sqlite3 = sqlite3pkg.verbose();
const db = new sqlite3.Database(path.join(__dirname, "main.db"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/* pages */
app.get("/", (q, r) => { r.sendFile(path.join(__dirname, "public", "index.html")); });
app.get("/418", (q, r) => { r.send("im a teapot"); });

/* mobile pages */
app.get("/mobile", (q, r) => { r.sendFile(path.join(__dirname, "public", "mobile", "mobile.html")); });

/* raw files */
app.get("/style.css", (q, r) => { r.set("Content-Type", "text/css"); r.sendFile(path.join(__dirname, "public", "style.css")); });
app.get("/mobilestyle.css", (q, r) => { r.set("Content-Type", "text/css"); r.sendFile(path.join(__dirname, "public", "mobile", "mobilestyle.css")); });
app.get("/background.png", (q, r) => { r.set("Content-Type", "image/png"); r.sendFile(path.join(__dirname, "public", "images", "background.png")); });
app.get("/favicon.png", (q, r) => { r.set("Content-Type", "image/png"); r.sendFile(path.join(__dirname, "public", "images", "favicon.png")); });
app.get("/akalysi.png", (q, r) => { r.set("Content-Type", "image/png"); r.sendFile(path.join(__dirname, "public", "images", "akalysi.png")); });

/* middleware and libraries */
app.get("/mobile/:url", (q, r) => {
    r.send(fs.readFileSync(path.join(__dirname, "public", "error", "mobile", "404mobile.html"), "utf-8")
    .replaceAll("{req_url}", q.params.url));
});

app.use((q, r, next) => {
    r.status(404).send(fs.readFileSync(path.join(__dirname, "public", "error", "404.html"), "utf-8")
    .replaceAll("{req_url}", q.originalUrl));

    next();
});

io.on("connection", (socket) => {
    io.emit("onlineupdate", io.sockets.sockets.size);
    socket.on("disconnect", () => {
        io.emit("onlineupdate", io.sockets.sockets.size);
    });
});

process.on("SIGINT", () => {
    console.log("bye bye");
    db.close();
    process.exit(0);
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}.\n`);
});