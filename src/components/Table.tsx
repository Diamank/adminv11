import React from 'react'
type Props = { headers: string[]; rows: React.ReactNode[][]; emptyText?: string }
export default function Table({ headers, rows, emptyText='Sem dados' }: Props){
  return (
    <div className="overflow-auto border rounded-2xl bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50"><tr>
          {headers.map((h,i)=>(<th key={i} className="text-left px-4 py-2 font-medium text-gray-600">{h}</th>))}
        </tr></thead>
        <tbody>
          {rows.length===0 ? <tr><td className="px-4 py-5" colSpan={headers.length}>{emptyText}</td></tr>
          : rows.map((r,ri)=>(<tr key={ri} className="border-t">{r.map((c,ci)=>(<td key={ci} className="px-4 py-2">{c}</td>))}</tr>))}
        </tbody>
      </table>
    </div>
  )
}
