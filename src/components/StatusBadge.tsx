import React from 'react'
export default function StatusBadge({ value }:{value:string}){const cls=value==='pendente'?'bg-yellow-100 text-yellow-800':(value==='pago'||value==='recebido')?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700';return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{value}</span>}
