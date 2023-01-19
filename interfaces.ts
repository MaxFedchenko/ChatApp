import { WebSocket } from 'ws'
import { ClientMsgType, ServerMsgType } from './enums'

export interface ClientMsg {
  type: ClientMsgType
  room: string
  name: string
  message: string
}
export interface ServerMsg {
  type: ServerMsgType
  name?: string
  message: string
}
export interface Client {
  name: string
  socket: WebSocket
}
export interface Room {
  [index: string]: Client
}
export interface Rooms {
  [index: string]: Room
}
