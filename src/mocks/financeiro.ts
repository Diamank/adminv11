import { PagarReceber } from '@/types'
export const pagarMock: PagarReceber[] = [
  { id:'p1', tipo:'pagar', descricao:'Repasse Agro Silva (NF-1001)', data:'2025-08-20', valor:21000, status:'pendente' }
]
export const receberMock: PagarReceber[] = [
  { id:'r1', tipo:'receber', descricao:'Recebimento Mercado XPTO (NF-1001)', data:'2025-09-10', valor:22000, status:'pendente' }
]
