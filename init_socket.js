"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const rooms = {};
function broadcastToRoom(room, sender, msg) {
    if (rooms[room])
        for (const uuid in rooms[room]) {
            if (rooms[room][uuid].socket != sender)
                rooms[room][uuid].socket.send(JSON.stringify({
                    type: msg.type,
                    name: msg.name,
                    message: msg.message,
                }));
        }
}
function InitSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', function (ws) {
        let client_room;
        let client_uuid;
        ws.on('open', function (e) {
            console.log('Open event', e);
        });
        ws.on('error', function (error) {
            console.log('Error event', error);
        });
        ws.on('message', function (data) {
            console.log('Message received %s', data);
            const msg = JSON.parse(data);
            if (msg.type == "join" /* ClientMsgType.join */) {
                if (!rooms[msg.room])
                    rooms[msg.room] = {};
                client_room = msg.room;
                client_uuid = (0, uuid_1.v4)();
                rooms[msg.room][client_uuid] = { name: msg.name, socket: ws };
                broadcastToRoom(msg.room, ws, {
                    type: "notification" /* ServerMsgType.notification */,
                    message: `${msg.name} joined the group`,
                });
            }
            else if (msg.type == "message" /* ClientMsgType.message */) {
                broadcastToRoom(msg.room, ws, {
                    type: "message" /* ServerMsgType.message */,
                    name: rooms[client_room][client_uuid].name,
                    message: msg.message,
                });
            }
        });
        ws.on('close', function (e) {
            console.log('WS Close Event', e);
            ws.close();
            const name = rooms[client_room][client_uuid].name;
            delete rooms[client_room][client_uuid];
            if (Object.entries(rooms[client_room]).length == 0)
                delete rooms[client_room];
            broadcastToRoom(client_room, ws, {
                type: "notification" /* ServerMsgType.notification */,
                message: `${name} leaved the group`,
            });
        });
    });
    wss.on('close', function close(e) {
        console.log('Connection closed', e);
    });
}
exports.default = InitSocket;
