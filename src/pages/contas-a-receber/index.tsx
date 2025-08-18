import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import StatusBadge from '@/components/StatusBadge'
import { receberMock } from '@/mocks/financeiro'
export default function ContasReceber(){const headers=['Descrição','Data','Valor (R$)','Status'];const rows=receberMock.map(t=>[t.descricao,t.data,t.valor.toLocaleString('pt-BR'),<StatusBadge key={t.id} value={t.status}/>]);return(<AdminLayout><Table headers={headers} rows={rows}/></AdminLayout>)}
