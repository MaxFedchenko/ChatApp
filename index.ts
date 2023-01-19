import http from 'http'
import express, { Request, Response } from 'express'
const app = express()
import InitSocket from './init_socket'

app.use(express.static(__dirname + '/client'))
app.get('*', function (req: Request, res: Response) {
  res.redirect('client.html')
})
const server = http.createServer(app)
InitSocket(server)

server.listen(3000)
