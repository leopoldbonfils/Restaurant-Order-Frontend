import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let client = null

export function connectWebSocket({ onOrderUpdate, tableNumber }) {
  client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe('/topic/orders', (msg) => {
        const event = JSON.parse(msg.body)
        onOrderUpdate?.(event)
      })

      if (tableNumber) {
        client.subscribe(`/topic/orders/${tableNumber}`, (msg) => {
          const event = JSON.parse(msg.body)
          onOrderUpdate?.(event)
        })
      }
    },
  })

  client.activate()
  return client
}

export function disconnectWebSocket() {
  client?.deactivate()
  client = null
}