import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Capas de Fardo" },
      { name: "description", content: "Gera PDF com múltiplas capas de fardo para expedição." },
    ],
  }),
  component: Index,
});

type Operacao = "ROTA" | "CS" | "REAB";

interface FormData {
  operacao: Operacao;
  etiqueta: string;
  separacao: string;
  pedido: string;
  qtChps: string;
  matricula: string;
  doca: string;
  fardos: string;
}

const initial: FormData = {
  operacao: "ROTA",
  etiqueta: "",
  separacao: "",
  pedido: "",
  qtChps: "",
  matricula: "",
  doca: "",
  fardos: "1",
};

function Index() {
  const [data, setData] = useState<FormData>(initial);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const gerarPDF = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const total = parseInt(data.fardos, 10);
    if (!data.separacao.trim() || !data.pedido.trim() || !data.qtChps.trim() ||
        !data.matricula.trim() || !data.doca.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!Number.isFinite(total) || total < 1 || total > 999) {
      setError("Quantidade de fardos deve ser entre 1 e 999.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= total; i++) {
      if (i > 1) doc.addPage();
      desenharCapa(doc, data, i, total, pageW, pageH);
    }

    const nome = `capas_fardo_${data.pedido.trim().replace(/\s+/g, "_")}.pdf`;
    doc.save(nome);
  };

  const limpar = () => {
    setData(initial);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <div className="inline-block bg-[#7DBB57] text-black font-black text-2xl px-4 py-2 rounded">
            Gerador de Capas de Fardo
          </div>
          <p className="mt-3 text-slate-600 text-sm">
            Preencha os dados de expedição e gere o PDF com uma capa por fardo.
          </p>
        </header>

        <form
          onSubmit={gerarPDF}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de operação *
            </label>
            <div className="flex gap-4">
              {(["ROTA", "CS", "REAB"] as Operacao[]).map((op) => (
                <label key={op} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="operacao"
                    value={op}
                    checked={data.operacao === op}
                    onChange={() => update("operacao", op)}
                    className="accent-[#7DBB57]"
                  />
                  <span className="font-medium">{op}</span>
                </label>
              ))}
            </div>
          </div>

          <Field label="ETIQUETA" value={data.etiqueta} onChange={(v) => update("etiqueta", v)} />
          <Field label="SEPARAÇÃO *" value={data.separacao} onChange={(v) => update("separacao", v)} required />
          <Field label="PEDIDO *" value={data.pedido} onChange={(v) => update("pedido", v)} required />
          <Field label="QT CHPs *" value={data.qtChps} onChange={(v) => update("qtChps", v)} required type="number" />
          <Field label="MATRICULA SEPARADOR *" value={data.matricula} onChange={(v) => update("matricula", v)} required />
          <Field label="DOCA EXPEDIÇÃO *" value={data.doca} onChange={(v) => update("doca", v)} required />
          <Field
            label="QUANTIDADE DE FARDOS *"
            value={data.fardos}
            onChange={(v) => update("fardos", v)}
            required
            type="number"
            min={1}
            max={999}
          />

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#7DBB57] hover:bg-[#6ba847] text-black font-bold px-5 py-2.5 rounded transition-colors"
            >
              Gerar PDF
            </button>
            <button
              type="button"
              onClick={limpar}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium px-5 py-2.5 rounded transition-colors"
            >
              Limpar formulário
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7DBB57] focus:border-transparent"
      />
    </div>
  );
}

function desenharCapa(
  doc: jsPDF,
  d: FormData,
  n: number,
  total: number,
  pageW: number,
  pageH: number,
) {
  const margin = 10;
  const x = margin;
  const y = margin;
  const w = pageW - margin * 2;
  const h = pageH - margin * 2;

  const headerH = 25;
  const rightW = w * 0.35;
  const leftW = w - rightW;
  const bodyY = y + headerH;
  const bodyH = h - headerH;

  // Header verde
  doc.setFillColor(125, 187, 87);
  doc.rect(x, y, w, headerH, "F");
  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.rect(x, y, w, headerH);

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  const mark = (op: string) => (d.operacao === op ? "X" : " ");
  const headerText = `ROTA(${mark("ROTA")}) CS(${mark("CS")}) REAB(${mark("REAB")})`;
  doc.text(headerText, x + w / 2, y + headerH / 2 + 3, { align: "center" });

  // Corpo — moldura
  doc.rect(x, bodyY, w, bodyH);

  // Divisão vertical esquerda/direita
  const splitX = x + leftW;
  doc.line(splitX, bodyY, splitX, bodyY + bodyH);

  // Esquerda: célula superior vazia + linhas de campos
  const topCellH = bodyH * 0.35;
  const rowsY = bodyY + topCellH;
  doc.line(x, rowsY, splitX, rowsY);

  const rows: Array<[string, string, number]> = [
    ["SEPARAÇÃO", d.separacao, 16],
    ["PEDIDO", d.pedido, 14],
    ["QT CHPs", d.qtChps, 14],
    ["MATRICULA SEPARADOR", d.matricula, 11],
    ["DOCA EXPEDIÇÃO", d.doca, 13],
  ];
  const rowH = (bodyY + bodyH - rowsY) / rows.length;
  const labelColW = leftW * 0.5;

  rows.forEach((row, idx) => {
    const [label, value, size] = row;
    const ry = rowsY + rowH * idx;
    if (idx > 0) doc.line(x, ry, splitX, ry);
    // divisor label/valor
    doc.line(x + labelColW, ry, x + labelColW, ry + rowH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(label, x + labelColW / 2, ry + rowH / 2 + size / 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(value || "", x + labelColW + (leftW - labelColW) / 2, ry + rowH / 2 + 2, {
      align: "center",
    });
  });

  // Direita: ETIQUETA topo, FARDO embaixo
  const rightTopH = bodyH * 0.35;
  doc.line(splitX, bodyY + rightTopH, x + w, bodyY + rightTopH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ETIQUETA", splitX + rightW / 2, bodyY + 12, { align: "center" });
  if (d.etiqueta) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(d.etiqueta, splitX + rightW / 2, bodyY + 22, { align: "center" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  const fardoCenterY = bodyY + rightTopH + (bodyH - rightTopH) / 2;
  doc.text("FARDO", splitX + rightW / 2, fardoCenterY - 8, { align: "center" });
  doc.setFontSize(42);
  doc.text(`${n}/${total}`, splitX + rightW / 2, fardoCenterY + 20, { align: "center" });
}
