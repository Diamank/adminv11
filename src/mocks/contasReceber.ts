// Tipagem usada em Contas a Receber
export type ContaReceberItem = {
  id: string
  descricao: string
  data?: string            // data prevista/lançamento
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
  sacadoId?: string
  sacadoNome?: string
}

// Semente inicial (usada no localStorage)
export const contasReceberSeed: ContaReceberItem[] = [
  {
    id: 'cr-001',
    descricao: 'Recebimento Mercado XPTO (NF-1001)',
    data: '2025-09-10',
    valor: 22000,
    status: 'pendente',
    sacadoId: 'sac-001',
    sacadoNome: 'Mercado XPTO',
  },
  {
    id: 'cr-002',
    descricao: 'Recebimento Lojas Alpha (NF-3004)',
    data: '2025-09-05',
    valor: 5400,
    status: 'pago',
    sacadoId: 'sac-002',
    sacadoNome: 'Lojas Alpha SA',
  },
  {
    id: 'cr-003',
    descricao: 'Recebimento Mercado XPTO (NF-1002)',
    data: '2025-08-28',
    valor: 7800,
    status: 'atrasado',
    sacadoId: 'sac-001',
    sacadoNome: 'Mercado XPTO',
  },
]
