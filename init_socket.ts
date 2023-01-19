import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { ClientMsgType, ServerMsgType } from './enums'
import { ClientMsg, Rooms, ServerMsg } from './interfaces'

const rooms: Rooms = {}

function broadcastToRoom(room: string, sender: WebSocket, msg: ServerMsg) {
  if (rooms[room])
    for (const uuid in rooms[room]) {
      if (rooms[room][uuid].socket != sender)
        rooms[room][uuid].socket.send(
          JSON.stringify({
            type: msg.type,
            name: msg.name,
            message: msg.message,
          })
        )
    }
}

export default function InitSocket(server: Server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', function (ws: WebSocket) {
    let client_room: string
    let client_uuid: string

    ws.on('open', function (e: any) {
      console.log('Open event', e)
    })
    ws.on('error', function (error) {
      console.log('Error event', error)
    })
    ws.on('message', function (data: string) {
      console.log('Message received %s', data)
      const msg: ClientMsg = JSON.parse(data)

      if (msg.type == ClientMsgType.join) {
        if (!rooms[msg.room]) rooms[msg.room] = {}
        client_room = msg.room
        client_uuid = uuidv4()
        rooms[msg.room][client_uuid] = { name: msg.name, socket: ws }

        broadcastToRoom(msg.room, ws, {
          type: ServerMsgType.notification,
          message: `${msg.name} joined the group`,
        })
      } else if (msg.type == ClientMsgType.message) {
        broadcastToRoom(msg.room, ws, {
          type: ServerMsgType.message,
          name: rooms[client_room][client_uuid].name,
          message: msg.message,
        })
      }
    })
    ws.on('close', function (e) {
      console.log('WS Close Event', e)
      ws.close()
      const name = rooms[client_room][client_uuid].name
      delete rooms[client_room][client_uuid]
      if (Object.entries(rooms[client_room]).length == 0)
        delete rooms[client_room]
      broadcastToRoom(client_room, ws, {
        type: ServerMsgType.notification,
        message: `${name} leaved the group`,
      })
    })
  })
  wss.on('close', function close(e: any) {
    console.log('Connection closed', e)
  })
}
