export type StatusFinanceiro = 'pendente' | 'pago' | 'recebido'
export interface Cedente { id:string; cnpj:string; razao:string; endereco:string; contaBancaria:string; criadoEm:string }
export interface Sacado { id:string; cnpj:string; razao:string; endereco:string; criadoEm:string }
export interface Contrato { id:string; cedenteId:string; cedenteRazao:string; tipoOperacao:'Antecipacao'|'Outro'; limite:number; criadoEm:string }
export interface Nota { id:string; numero:string; valor:number; emissao:string; vencimento:string; cedenteId:string; cedenteRazao:string; contratoId:string; sacadoId:string; sacadoRazao:string; criadoEm:string }
export interface PagarReceber { id:string; tipo:'pagar'|'receber'; descricao:string; data:string; valor:number; status:StatusFinanceiro }
