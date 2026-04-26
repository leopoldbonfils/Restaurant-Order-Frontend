import { useState, useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

/* ────────────────────────────────────────────────────────────────────── */
/*  WebSocket client – singleton STOMP connection over SockJS           */
/* ────────────────────────────────────────────────────────────────────── */

let stompClient = null
let socket      = null
let subscriptions = new Map()

/**
 * Connect to the backend WebSocket and subscribe to topics.
 *
 * Backend publishes to:
 *   /topic/orders          – all order events (kitchen board)
 *   /topic/orders/{table}  – table-specific events (customer tracking)
 *
 * @param {Object}   options
 * @param {string}  [options.tableNumber]   – subscribe to table-specific topic
 * @param {Function}[options.onOrderUpdate] – callback(event) on each message
 */
export function connectWebSocket({ tableNumber, onOrderUpdate }) {
  if (stompClient?.connected) {
    if (tableNumber && onOrderUpdate) {
      subscribeToTable(tableNumber, onOrderUpdate)
    }
    return
  }

  socket      = new SockJS('/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay:   5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  stompClient.debug = (str) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[STOMP]', str)
    }
  }

  stompClient.onConnect = () => {
    console.log('✅ WebSocket connected')

    // ── Kitchen broadcast ─────────────────────────────────────────────────
    // Backend publishes to /topic/orders — matches OrderNotificationService
    stompClient.subscribe('/topic/orders', (message) => {
      try {
        const event = JSON.parse(message.body)
        subscriptions.forEach((sub) => {
          if (typeof sub.callback === 'function') sub.callback(event)
        })
      } catch (e) {
        console.error('Failed to parse WebSocket message', e)
      }
    })

    // ── Table-specific topic ──────────────────────────────────────────────
    // Backend publishes to /topic/orders/{tableNumber}
    if (tableNumber && onOrderUpdate) {
      subscribeToTable(tableNumber, onOrderUpdate)
    }
  }

  stompClient.onStompError = (frame) => {
    console.error('❌ STOMP error', frame)
  }

  stompClient.activate()
}

function subscribeToTable(tableNumber, onOrderUpdate) {
  // Backend: /topic/orders/{tableNumber} — see OrderNotificationService.java
  const topic = `/topic/orders/${tableNumber}`

  if (subscriptions.has(topic)) {
    const existing = subscriptions.get(topic)
    if (existing.sub) existing.sub.unsubscribe()
  }

  if (!stompClient?.connected) return

  const sub = stompClient.subscribe(topic, (message) => {
    try {
      const event = JSON.parse(message.body)
      onOrderUpdate?.(event)
    } catch (e) {
      console.error('Failed to parse table message', e)
    }
  })

  subscriptions.set(topic, { sub, callback: onOrderUpdate })
}

/**
 * Register a callback for the global /topic/orders channel.
 * Used by KitchenPage to receive all order events.
 */
export function registerGlobalCallback(key, callback) {
  subscriptions.set(key, { callback })
}

export function unregisterGlobalCallback(key) {
  subscriptions.delete(key)
}

export function disconnectWebSocket() {
  subscriptions.forEach((entry) => {
    if (entry.sub) entry.sub.unsubscribe()
  })
  subscriptions.clear()

  if (stompClient) {
    stompClient.deactivate()
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