import { useState, useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

/* ────────────────────────────────────────────────────────────────────── */
/*  WebSocket client – singleton STOMP connection over SockJS          */
/* ────────────────────────────────────────────────────────────────────── */

let stompClient = null
let socket = null
let subscriptions = new Map()

/**
 * Connect to the backend WebSocket and subscribe to topics.
 *
 * @param {Object}   options
 * @param {string}  [options.tableNumber]   – subscribe to table-specific topic
 * @param {Function}[options.onOrderUpdate] – callback(event) on each message
 */
export function connectWebSocket({ tableNumber, onOrderUpdate }) {
  if (stompClient?.connected) {
    // Already connected – just add subscription if needed
    if (tableNumber && onOrderUpdate) {
      subscribeToTable(tableNumber, onOrderUpdate)
    }
    return
  }

  // Create SockJS socket
  socket = new SockJS('/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  // Disable debug logging in production
  stompClient.debug = (str) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[STOMP]', str)
    }
  }

  stompClient.onConnect = () => {
    console.log('✅ WebSocket connected')

    // Subscribe to kitchen broadcast (all staff)
    stompClient.subscribe('/topic/kitchen', (message) => {
      try {
        const event = JSON.parse(message.body)
        subscriptions.forEach((callback) => callback(event))
      } catch (e) {
        console.error('Failed to parse WebSocket message', e)
      }
    })

    // Subscribe to table-specific topic
    if (tableNumber) {
      subscribeToTable(tableNumber, onOrderUpdate)
    }
  }

  stompClient.onStompError = (frame) => {
    console.error('❌ STOMP error', frame)
  }

  stompClient.activate()
}

function subscribeToTable(tableNumber, onOrderUpdate) {
  const topic = `/topic/table/${tableNumber}`
  
  // Remove existing subscription if any
  if (subscriptions.has(topic)) {
    subscriptions.get(topic).unsubscribe()
  }

  const sub = stompClient.subscribe(topic, (message) => {
    try {
      const event = JSON.parse(message.body)
      onOrderUpdate?.(event)
    } catch (e) {
      console.error('Failed to parse table message', e)
    }
  })

  subscriptions.set(topic, { unsubscribe: () => sub.unsubscribe() })
}

/**
 * Disconnect from the WebSocket.
 */
export function disconnectWebSocket() {
  subscriptions.forEach((sub) => sub.unsubscribe())
  subscriptions.clear()

  if (stompClient) {
    stompClient.disconnect()
    stompClient = null
  }
  if (socket) {
    socket.close()
    socket = null
  }
  console.log('🔌 WebSocket disconnected')
}

/* ────────────────────────────────────────────────────────────────────── */
/*  React hook – useWebSocket                                            */
/* ────────────────────────────────────────────────────────────────────── */

/**
 * useWebSocket — connect to the STOMP/SockJS endpoint and receive
 * real-time order events from the backend.
 *
 * @param {Object}   options
 * @param {string}   [options.tableNumber]   – subscribe to table-specific topic
 * @param {Function} [options.onOrderUpdate] – callback(event) on each message
 * @param {boolean}  [options.enabled=true]  – set false to skip connecting
 *
 * @returns {{ connected: boolean, reconnect: Function }}
 */
export function useWebSocket({ onOrderUpdate, tableNumber, enabled = true } = {}) {
  const [connected, setConnected] = useState(false)

  /* Keep the latest callback in a ref so the effect doesn't re-run
     when the parent re-renders and creates a new function reference. */
  const callbackRef = useRef(onOrderUpdate)
  useEffect(() => { callbackRef.current = onOrderUpdate }, [onOrderUpdate])

  const connect = useCallback(() => {
    if (!enabled) return

    connectWebSocket({
      tableNumber,
      onOrderUpdate: (event) => callbackRef.current?.(event),
    })
    setConnected(true)
  }, [tableNumber, enabled])

  useEffect(() => {
    connect()
    return () => {
      disconnectWebSocket()
      setConnected(false)
    }
  }, [connect])

  return { connected, reconnect: connect }
}