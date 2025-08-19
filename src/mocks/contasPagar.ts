// Tipagem usada em Contas a Pagar
export type ContaPagarItem = {
  id: string
  descricao: string
  data?: string                 // emissão
  vencimento?: string           // usado nos filtros/coluna
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
  cedenteId?: string
  cedenteNome?: string
  nota?: { vencimento?: string } // fallback caso não venha "vencimento"
}

// Mock de exemplo (semente inicial do localStorage)
export const contasPagarSeed: ContaPagarItem[] = [
  {
    id: 'cp-001',
    descricao: 'Repasse Agro Silva (NF-1001)',
    data: '2025-08-15',
    vencimento: '2025-08-20',
    valor: 21000,
    status: 'pendente',
    cedenteId: 'ced-001',
    cedenteNome: 'Agro Silva LTDA',
  },
  {
    id: 'cp-002',
    descricao: 'Repasse Transporte Neo (NF-220)',
    data: '2025-08-05',
    nota: { vencimento: '2025-08-25' }, // sem "vencimento" -> usa fallback
    valor: 8500,
    status: 'pago',
    cedenteId: 'ced-002',
    cedenteNome: 'Transporte Neo ME',
  },
  {
    id: 'cp-003',
    descricao: 'Repasse Agro Silva (NF-1002)',
    data: '2025-07-28',
    vencimento: '2025-08-10',
    valor: 12500,
    status: 'atrasado',
    cedenteId: 'ced-001',
    cedenteNome: 'Agro Silva LTDA',
  },
]
