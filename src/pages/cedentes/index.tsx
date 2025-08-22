import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search } from "lucide-react";

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

export default function CedentesPage() {
  const [cedentes, setCedentes] = useState<Cedente[]>([]);
  const [search, setSearch] = useState("");

  async function carregarCedentes() {
    let query = supabase.from("cedentes").select("*").order("created_at", { ascending: false });

    if (search.trim() !== "") {
      query = query.ilike("razao_social", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Erro ao buscar cedentes:", error);
    } else {
      setCedentes(data || []);
    }
  }

  useEffect(() => {
    carregarCedentes();
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Cedentes</h1>
        <div className="flex items-center gap-2 border rounded px-2 py-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar cedente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-2">Razão Social</th>
              <th className="px-4 py-2">CNPJ</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">Endereço</th>
              <th className="px-4 py-2">Conta</th>
              <th className="px-4 py-2">Risco</th>
              <th className="px-4 py-2">Criado</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cedentes.length > 0 ? (
              cedentes.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{c.razao_social}</td>
                  <td className="px-4 py-2">{c.cnpj}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.telefone}</td>
                  <td className="px-4 py-2">{c.endereco}</td>
                  <td className="px-4 py-2">{c.conta_bancaria}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        c.risco === "sem_risco"
                          ? "bg-green-500"
                          : c.risco === "moderado"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-2">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-blue-600 hover:underline">Editar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                  Nenhum cedente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
