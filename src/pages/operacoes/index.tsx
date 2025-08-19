import { FileText, FilePlus } from "lucide-react"

export default function Operacoes() {
  const opcoes = [
    {
      titulo: "Cadastrar Contrato",
      descricao: "Crie um novo contrato e defina o limite do cedente.",
      icone: <FileText className="h-6 w-6 text-indigo-500" />,
      link: "/operacoes/novo-contrato",
    },
    {
      titulo: "Cadastrar Nota Fiscal",
      descricao: "Adicione notas fiscais e vincule ao contrato.",
      icone: <FilePlus className="h-6 w-6 text-green-500" />,
      link: "/operacoes/nova-nota",
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Operações</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opcoes.map((op, i) => (
          <a
            key={i}
            href={op.link}
            className="rounded-xl border bg-white shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition"
          >
            <div className="p-3 rounded-lg bg-gray-100">{op.icone}</div>
            <div>
              <h2 className="text-lg font-medium">{op.titulo}</h2>
              <p className="text-sm text-gray-500">{op.descricao}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
