import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Cedente {
  id: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  email: string;
  telefone: string;
  endereco: string;
  conta_bancaria: string;
  risco: string;
  created_at: string;
}

export default function Cedentes() {
  const [cedentes, setCedentes] = useState<Cedente[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCedentes();
  }, []);

  async function fetchCedentes() {
    const { data, error } = await supabase
      .from("cedentes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setCedentes(data as Cedente[]);
    }
  }

  const filteredCedentes = cedentes.filter(
    (c) =>
      c.razao_social.toLowerCase().includes(search.toLowerCase()) ||
      c.nome_fantasia.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Cedentes</h1>

      {/* Campo de busca igual sacados */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center border rounded-lg px-3 py-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabela de Cedentes */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">CNPJ</th>
              <th className="px-4 py-2 text-left">Razão Social</th>
              <th className="px-4 py-2 text-left">Nome Fantasia</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Telefone</th>
              <th className="px-4 py-2 text-left">Endereço</th>
              <th className="px-4 py-2 text-left">Conta</th>
              <th className="px-4 py-2 text-left">Risco</th>
              <th className="px-4 py-2 text-left">Criado</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCedentes.length > 0 ? (
              filteredCedentes.map((cedente) => (
                <tr key={cedente.id} className="border-t">
                  <td className="px-4 py-2">{cedente.cnpj}</td>
                  <td className="px-4 py-2">{cedente.razao_social}</td>
                  <td className="px-4 py-2">{cedente.nome_fantasia}</td>
                  <td className="px-4 py-2">{cedente.email}</td>
                  <td className="px-4 py-2">{cedente.telefone}</td>
                  <td className="px-4 py-2">{cedente.endereco}</td>
                  <td className="px-4 py-2">{cedente.conta_bancaria}</td>
                  <td className="px-4 py-2 capitalize">{cedente.risco}</td>
                  <td className="px-4 py-2">
                    {new Date(cedente.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-blue-600 cursor-pointer">
                    Editar
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-2 text-center" colSpan={10}>
                  Nenhum cedente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
