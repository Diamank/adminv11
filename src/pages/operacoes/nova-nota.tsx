import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function NovaNota() {
  const [notas, setNotas] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Campos do formulário
  const [cedente, setCedente] = useState("");
  const [cnpjCedente, setCnpjCedente] = useState("");
  const [sacado, setSacado] = useState("");
  const [cnpjSacado, setCnpjSacado] = useState("");
  const [numeroNota, setNumeroNota] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [valorNota, setValorNota] = useState<number>(0);
  const [taxa, setTaxa] = useState<number>(0);
  const [iof, setIof] = useState<number>(0.38);
  const [tarifaFixa, setTarifaFixa] = useState<number>(0);

  const [arquivoNota, setArquivoNota] = useState<File | null>(null);
  const [arquivoBoleto, setArquivoBoleto] = useState<File | null>(null);
  const [arquivoAditivo, setArquivoAditivo] = useState<File | null>(null);

  // Buscar notas
  useEffect(() => {
    carregarNotas();
  }, []);

  async function carregarNotas() {
    const { data, error } = await supabase.from("notas").select("*");
    if (!error) setNotas(data || []);
  }

  function limparForm() {
    setCedente("");
    setCnpjCedente("");
    setSacado("");
    setCnpjSacado("");
    setNumeroNota("");
    setDataEmissao("");
    setDataVencimento("");
    setValorNota(0);
    setTaxa(0);
    setIof(0.38);
    setTarifaFixa(0);
    setArquivoNota(null);
    setArquivoBoleto(null);
    setArquivoAditivo(null);
    setEditingId(null);
  }

  async function salvarNota() {
    const payload = {
      cedente,
      cnpj_cedente: cnpjCedente,
      sacado,
      cnpj_sacado: cnpjSacado,
      numero: numeroNota,
      data_emissao: dataEmissao,
      data_vencimento: dataVencimento,
      valor: valorNota,
      taxa,
      iof,
      tarifa_fixa: tarifaFixa,
    };

    if (editingId) {
      await supabase.from("notas").update(payload).eq("id", editingId);
    } else {
      await supabase.from("notas").insert(payload);
    }

    limparForm();
    setMostrarForm(false);
    carregarNotas();
  }

  function editarNota(nota: any) {
    setCedente(nota.cedente);
    setCnpjCedente(nota.cnpj_cedente);
    setSacado(nota.sacado);
    setCnpjSacado(nota.cnpj_sacado);
    setNumeroNota(nota.numero);
    setDataEmissao(nota.data_emissao);
    setDataVencimento(nota.data_vencimento);
    setValorNota(nota.valor);
    setTaxa(nota.taxa);
    setIof(nota.iof);
    setTarifaFixa(nota.tarifa_fixa);
    setEditingId(nota.id);
    setMostrarForm(true);
  }

  // Cálculos
  const dias = dataEmissao && dataVencimento
    ? Math.ceil(
        (new Date(dataVencimento).getTime() - new Date(dataEmissao).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const desconto = ((valorNota * (taxa / 100)) / 30) * dias;
  const valorIOF = (valorNota * iof) / 100;
  const liquido = valorNota - desconto - valorIOF - tarifaFixa;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notas</h1>
        <button
          onClick={() =>
            setMostrarForm((prev) => {
              const next = !prev;
              if (!next) limparForm();
              return next;
            })
          }
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          {mostrarForm ? "Fechar" : editingId ? "Fechar" : "Nova Nota"}
        </button>
      </div>

      {/* Lista */}
      <Accordion type="single" collapsible className="w-full space-y-2">
        {notas.map((nota) => (
          <AccordionItem key={nota.id} value={`nota-${nota.id}`}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span>
                  #{nota.numero} - {nota.cedente} → {nota.sacado}
                </span>
                <span>R$ {nota.valor.toFixed(2)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-gray-50 rounded-md space-y-2">
                <p>
                  <strong>Emissão:</strong> {nota.data_emissao}
                </p>
                <p>
                  <strong>Vencimento:</strong> {nota.data_vencimento}
                </p>
                <p>
                  <strong>Dias:</strong> {dias}
                </p>
                <p>
                  <strong>Taxa:</strong> {nota.taxa}% a.m.
                </p>
                <p>
                  <strong>IOF:</strong> {nota.iof}%
                </p>
                <p>
                  <strong>Tarifa:</strong> R$ {nota.tarifa_fixa}
                </p>
                <p>
                  <strong>Líquido:</strong> R$ {liquido.toFixed(2)}
                </p>
                <button
                  onClick={() => editarNota(nota)}
                  className="mt-2 px-3 py-1 rounded bg-blue-600 text-white"
                >
                  Editar
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-white shadow p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-bold">
            {editingId ? "Editar Nota" : "Cadastrar Nota (Antecipação)"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Cedente</label>
              <input
                value={cedente}
                onChange={(e) => setCedente(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">CNPJ do Cedente</label>
              <input
                value={cnpjCedente}
                onChange={(e) => setCnpjCedente(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Sacado</label>
              <input
                value={sacado}
                onChange={(e) => setSacado(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">CNPJ do Sacado</label>
              <input
                value={cnpjSacado}
                onChange={(e) => setCnpjSacado(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Número da Nota</label>
              <input
                value={numeroNota}
                onChange={(e) => setNumeroNota(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Valor da Nota</label>
              <input
                type="number"
                value={valorNota}
                onChange={(e) => setValorNota(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Data de Emissão</label>
              <input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">Data de Vencimento</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Taxa (% a.m.)</label>
              <input
                type="number"
                value={taxa}
                onChange={(e) => setTaxa(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">IOF (%)</label>
              <input
                type="number"
                value={iof}
                onChange={(e) => setIof(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">Tarifa Fixa (R$)</label>
              <input
                type="number"
                value={tarifaFixa}
                onChange={(e) => setTarifaFixa(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <p className="text-sm">Dias</p>
              <p className="font-bold">{dias}</p>
            </div>
            <div>
              <p className="text-sm">Desconto</p>
              <p className="font-bold">R$ {desconto.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm">IOF</p>
              <p className="font-bold">R$ {valorIOF.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm">Líquido ao Cedente</p>
              <p className="font-bold">R$ {liquido.toFixed(2)}</p>
            </div>
          </div>

          {/* Upload */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>Anexo — Nota Fiscal</label>
              <input
                type="file"
                onChange={(e) => setArquivoNota(e.target.files?.[0] || null)}
                className="w-full border border-dashed rounded px-3 py-8 text-center cursor-pointer"
              />
            </div>
            <div>
              <label>Anexo — Boleto</label>
              <input
                type="file"
                onChange={(e) => setArquivoBoleto(e.target.files?.[0] || null)}
                className="w-full border border-dashed rounded px-3 py-8 text-center cursor-pointer"
              />
            </div>
            <div>
              <label>Anexo — Aditivo</label>
              <input
                type="file"
                onChange={(e) => setArquivoAditivo(e.target.files?.[0] || null)}
                className="w-full border border-dashed rounded px-3 py-8 text-center cursor-pointer"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={salvarNota}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Salvar
            </button>
            <button
              onClick={limparForm}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
