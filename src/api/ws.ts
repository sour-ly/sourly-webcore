import { api } from ".."
import { Eventful } from "../event/events"
import { APITypes } from "./api"

export namespace WebSocketTypes {
	export type GenericJSONResponse = {
		type: 'notification' | 'join' | 'error' | 'ping'
		data: any
	}

	export type Notification = {
		type: 'notification'
		data: APITypes.Notification
	}
}

export namespace SourlyWebSocket {

	class WebSocketError extends Error {
		constructor(message: string) {
			super(message)
			this.name = 'WebSocketError'
		}
	}

	type WebSocketEventMap = {
		//connection opened
		onConnect: WebSocketTypes.GenericJSONResponse
		//connection closed
		onDisconnect: WebSocketTypes.GenericJSONResponse

		onNotification: WebSocketTypes.Notification
		onJoin: WebSocketTypes.GenericJSONResponse
		onError: WebSocketTypes.GenericJSONResponse
		onPing: WebSocketTypes.GenericJSONResponse
		onMessage: WebSocketTypes.GenericJSONResponse
	}

	class WebSocketInstance extends Eventful<WebSocketEventMap> {

		ws: WebSocket = null

		constructor() {
			super()
		}

		async connect(accessToken: string) {
			if (this.ws) {
				throw new WebSocketError('WebSocket already connected')
			}
			this.ws = new WebSocket(`${BASE_URL()}protected/ws?token=${accessToken}`);
			this.ws.onopen = () => {
				console.log('WebSocket connected')
				this.emit('onConnect', { type: 'join', data: 'WebSocket connected' })
			}
			this.ws.onclose = () => {
				this.emit('onDisconnect', { type: 'error', data: 'WebSocket disconnected' })
				this.close();
			}
			this.ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data)
					switch (data.type) {
						case 'notification':
							this.emit('onNotification', data)
							break
						case 'join':
							this.emit('onJoin', data)
							break
						case 'error':
							this.emit('onError', data)
							break
						case 'ping':
							this.emit('onPing', data)
							send({ type: 'pong', data: 'pong' })
							break
						default:
							this.emit('onMessage', data)
							break
					}
				} catch (e) {
					console.log('WebSocket error', e)
				}
			}
		}

		send(data: any) {
			if (!this.ws) {
				throw new WebSocketError('WebSocket not connected')
			}
			this.ws.send(JSON.stringify(data))
		}

		close() {
			if (!this.ws) {
				throw new WebSocketError('WebSocket not connected')
			}
			this.ws.close()
			this.ws = null
		}
	}


	var BASE_URL = () => {
		return `${api?.endpoint ?? 'http://localhost:3000'}/api/v1/`
	};

	let ws: WebSocketInstance = new WebSocketInstance()

	export const connect = ws.connect.bind(ws)
	export const send = ws.send.bind(ws)
	export const close = ws.close.bind(ws)
	export const on = ws.on.bind(ws)
	export const off = ws.off.bind(ws)
}
