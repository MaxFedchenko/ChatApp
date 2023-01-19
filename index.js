"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const init_socket_1 = __importDefault(require("./init_socket"));
app.use(express_1.default.static(__dirname + '/client'));
app.get('*', function (req, res) {
    res.redirect('client.html');
});
const server = http_1.default.createServer(app);
(0, init_socket_1.default)(server);
server.listen(3000);
