import React from 'react'
import OrderCard from './OrderCard'
import './KanbanBoard.css'

const COLUMNS = [
  { status: 'PENDING',   label: 'New orders', icon: '🕐', cls: 'col-amber'  },
  { status: 'PREPARING', label: 'Preparing',  icon: '👨‍🍳', cls: 'col-blue'   },
  { status: 'READY',     label: 'Ready',      icon: '✅', cls: 'col-green'  },
  { status: 'DELIVERED', label: 'Delivered',  icon: '🚚', cls: 'col-purple' },
]

export default function KanbanBoard({ orders, onAdvance }) {
  return (
    <div className="kanban">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.status)
        return (
          <div key={col.status} className="kanban-col">
            <div className={`kanban-col-header ${col.cls}`}>
              <span>{col.icon}</span>
              <span className="kanban-col-label">{col.label}</span>
              <span className="kanban-col-count">{colOrders.length}</span>
            </div>

            {colOrders.length === 0 ? (
              <div className="kanban-empty">No orders</div>
            ) : (
              colOrders.map((order) => (
                <OrderCard key={order.id} order={order} onAdvance={onAdvance} />
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}