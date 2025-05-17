/* AKESI: THE WEBSITE */
/* init */

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import sqlite3pkg from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
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
app.get("/", (q, r) => { r.sendFile(
    path.join(__dirname, "public", "index.html")
); });

/* raw files */
app.get("/style.css", (q, r) => { r.set("Content-Type", "text/css"); r.sendFile(
    path.join(__dirname, "public", "style.css")
); }); app.get("/background.png", (q, r) => { r.set("Content-Type", "image/png"); r.sendFile(
    path.join(__dirname, "public", "background.png")
); }); app.get("/favicon.png", (q, r) => { r.set("Content-Type", "image/png"); r.sendFile(
    path.join(__dirname, "public", "favicon.png")
); }); app.get("/steakpants.mp3", (q, r) => { r.set("Content-Type", "audio/mpeg"); r.sendFile(
    path.join(__dirname, "public", "steakpants.mp3")
); });

/* database & sockets */

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS last_note (id INTEGER PRIMARY KEY CHECK (id = 1), author TEXT, value TEXT)");
    db.run("INSERT OR IGNORE INTO last_note (id, author, value) VALUES (1, '', '')");
});

io.on("connection", (socket) => {
    console.log(`connection, ahhhhh ${socket.id}\n${io.sockets.sockets.size} client(s) on here\n`);

    io.emit("clients_update", io.sockets.sockets.size);
    socket.on("disconnect", () => {
        console.log(`${socket.id} was a coward and left\nwe now only have ${io.sockets.sockets.size} client(s)\n`);
        io.emit("clients_update", io.sockets.sockets.size);
    });

    socket.on("note_edit", (txt, user) => {
        txt = profanityFilter.clean(txt.substring(0,75));
        user = profanityFilter.clean(user.substring(0,30));
        db.serialize(() => {
            db.run("UPDATE last_note SET author = ?, value = ? WHERE id = 1", [user, txt]);
        });

        io.emit("note_update", txt, user);
    });
    
    db.get("SELECT * FROM last_note WHERE id = 1", [], (err, row) => {
        if (row) { socket.emit("note_update", row.value, row.author); }
    });    
});

/* end */

process.on("SIGINT", () => {
    console.log("bye bye");
    db.close();
    process.exit(0);
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}.\n`);
});