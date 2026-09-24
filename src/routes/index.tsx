import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Capas de Fardo" },
      {
        name: "description",
        content: "Gere PDFs A4 paisagem com capas de fardo para expedição.",
      },
    ],
  }),
  component: Index,
});

type Operacao = "ROTA" | "CS" | "REAB" | "";

interface FormData {
  operacao: Operacao;
  rota: string;
  separacao: string;
  pedido: string;
  qtChps: string;
  matricula: string;
  doca: string;
  fardos: string;
  data: string;
}

const initial: FormData = {
  operacao: "",
  rota: "",
  separacao: "",
  pedido: "",
  qtChps: "",
  matricula: "",
  doca: "",
  fardos: "",
  data: "",
};

function Index() {
  const [data, setData] = useState<FormData>(initial);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const gerarPDF = (e: FormEvent) => {
    e.preventDefault();

    const parsed = parseInt(data.fardos, 10);
    const hasFardos = !isNaN(parsed) && parsed > 0;
    const total = hasFardos ? Math.min(999, parsed) : 1;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= total; i++) {
      if (i > 1) doc.addPage();
      desenharCapa(doc, data, i, total, pageW, pageH, hasFardos);
    }

    const pedidoSafe = (data.pedido.trim() || "capas").replace(/\s+/g, "_");
    doc.save(`capas_fardo_${pedidoSafe}.pdf`);
  };

  const gerarBranco = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    desenharCapa(doc, initial, 1, 1, pageW, pageH, false);
    doc.save("capa_em_branco.pdf");
  };

  const limpar = () => setData(initial);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f1e3] via-[#faf6ea] to-[#f2ead5] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0d4a3a] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            F
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0d2a22]">
              Gerador de Capas de Fardo
            </h1>
            <p className="text-sm text-[#5a5a4d]">
              Preencha os dados e gere o PDF com uma capa por fardo.
            </p>
          </div>
        </header>

        <form
          onSubmit={gerarPDF}
          className="bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-[#e6dfc9] p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-[#0d2a22] mb-2">
              Tipo de operação
            </label>
            <div className="flex flex-wrap gap-3">
              {(["ROTA", "CS", "REAB"] as const).map((op) => {
                const active = data.operacao === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => update("operacao", active ? "" : op)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors border ${
                      active
                        ? "bg-[#0d4a3a] text-white border-[#0d4a3a]"
                        : "bg-white text-[#0d2a22] border-[#e6dfc9] hover:bg-[#f7f1e3]"
                    }`}
                  >
                    {op}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="ROTA" value={data.rota} onChange={(v) => update("rota", v)} required numeric maxLength={8} />
          <Field label="SEPARAÇÃO" value={data.separacao} onChange={(v) => update("separacao", v)} required numeric maxLength={12} />
          <Field label="PEDIDO" value={data.pedido} onChange={(v) => update("pedido", v)} required numeric maxLength={12} />
          <Field label="QT CHPs" value={data.qtChps} onChange={(v) => update("qtChps", v)} required numeric maxLength={8} />
          <Field label="MATRICULA SEPARADOR" value={data.matricula} onChange={(v) => update("matricula", v)} />
          <Field label="DOCA EXPEDIÇÃO" value={data.doca} onChange={(v) => update("doca", v)} required numeric maxLength={6} />
          <Field label="DATA" value={data.data} onChange={(v) => update("data", v)} type="date" required />
          <Field
            label="QUANTIDADE DE FARDOS"
            value={data.fardos}
            onChange={(v) => update("fardos", v)}
            numeric
            maxLength={3}
            required
          />


          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#0d4a3a] hover:bg-[#0a3b2e] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Gerar PDF
            </button>
            <button
              type="button"
              onClick={gerarBranco}
              className="bg-white hover:bg-[#f7f1e3] text-[#0d2a22] font-semibold px-5 py-2.5 rounded-lg transition-colors border border-[#e6dfc9]"
            >
              CAPA EM BRANCO
            </button>
            <button
              type="button"
              onClick={limpar}
              className="bg-white hover:bg-[#f7f1e3] text-[#0d2a22] font-medium px-5 py-2.5 rounded-lg transition-colors border border-[#e6dfc9]"
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
  type = "text",
  min,
  max,
  required,
  numeric,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
  numeric?: boolean;
  maxLength?: number;
}) {
  const handleChange = (raw: string) => {
    if (!numeric) return onChange(raw);
    // Mantém apenas dígitos (0-9), sem letras, espaços ou sinais.
    onChange(raw.replace(/\D/g, ""));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#0d2a22] mb-1">
        {label}
        {required && <span className="text-[#0d4a3a]"> *</span>}
        {numeric && (
          <span className="ml-2 text-xs font-normal text-[#8a8a78]">
            somente números
          </span>
        )}
      </label>
      <input
        type={numeric ? "text" : type}
        inputMode={numeric ? "numeric" : undefined}
        pattern={numeric ? "[0-9]*" : undefined}
        title={numeric ? "Digite somente números" : undefined}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        min={min}
        max={max}
        maxLength={maxLength}
        required={required}
        className="w-full border border-[#e6dfc9] bg-white rounded-lg px-3 py-2 text-[#0d2a22] focus:outline-none focus:ring-2 focus:ring-[#0d4a3a] focus:border-transparent"
      />
    </div>
  );
}


function formatData(iso: string) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!partes) return iso;
  return `${partes[3]}/${partes[2]}/${partes[1]}`;
}

function desenharCapa(
  doc: jsPDF,
  d: FormData,
  n: number,
  total: number,
  pageW: number,
  pageH: number,
  showFardo: boolean,
) {
  const margin = 10;
  const x = margin;
  const y = margin;
  const w = pageW - margin * 2;
  const h = pageH - margin * 2;

  const headerH = 28;
  const bodyY = y + headerH;
  const bodyH = h - headerH;

  // Right column narrower (like image ~30%)
  const rightW = w * 0.3;
  const leftW = w - rightW;
  const splitX = x + leftW;

  // Top area (empty on left, ETIQUETA on right) ~ 45% of body
  const topH = bodyH * 0.45;
  const bottomY = bodyY + topH;
  const bottomH = bodyH - topH;

  // ===== Header verde =====
  doc.setFillColor(125, 187, 87);
  doc.rect(x, y, w, headerH, "F");
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.rect(x, y, w, headerH);

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  const mark = (op: string) => (d.operacao === op ? "X" : "   ");
  const headerText = `ROTA(${mark("ROTA")}) CS(${mark("CS")}) REAB(${mark("REAB")})`;
  doc.text(headerText, x + w / 2, y + headerH / 2 + 4, { align: "center" });

  // ===== Moldura externa do corpo =====
  doc.rect(x, bodyY, w, bodyH);

  // Divisão vertical esquerda / direita
  doc.line(splitX, bodyY, splitX, bodyY + bodyH);

  // Divisão horizontal (topo / linhas)
  doc.line(x, bottomY, splitX, bottomY);
  doc.line(splitX, bottomY, x + w, bottomY);

  // ===== Topo direito: ETIQUETA =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("ETIQUETA", splitX + rightW / 2, bodyY + topH / 2 + 3, { align: "center" });

  // ===== Topo esquerdo: ROTA (valor grande) =====
  if (d.rota) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(160);
    doc.text(d.rota, x + leftW / 2, bodyY + topH / 2 + 20, { align: "center" });
  }

  // ===== Bottom right: DATA + FARDO =====
  const fardoCX = splitX + rightW / 2;
  if (d.data) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(formatData(d.data), fardoCX, bottomY + 12, { align: "center" });
  }
  const fardoTopY = bottomY + 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(54);
  doc.text("FARDO", fardoCX, fardoTopY, { align: "center" });
  if (showFardo) {
    doc.setFontSize(72);
    doc.text(`${n}/${total}`, fardoCX, fardoTopY + 36, { align: "center" });
    if (n === total && total > 1) {
      doc.setFontSize(40);
      doc.text("FIM", fardoCX, bottomY + bottomH - 8, { align: "center" });
    }
  }

  // ===== Bottom left: 5 linhas =====
  const rows: Array<[string, string, number]> = [
    ["SEPARAÇÃO", d.separacao, 18],
    ["PEDIDO", d.pedido, 18],
    ["QT CHPs", d.qtChps, 18],
    ["MATRICULA SEPARADOR", d.matricula, 12],
    ["DOCA EXPEDIÇÃO", d.doca, 16],
  ];
  const rowH = bottomH / rows.length;
  const labelColW = leftW * 0.42;

  rows.forEach((row, idx) => {
    const [label, value, size] = row;
    const ry = bottomY + rowH * idx;
    if (idx > 0) doc.line(x, ry, splitX, ry);
    doc.line(x + labelColW, ry, x + labelColW, ry + rowH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(label, x + labelColW / 2, ry + rowH / 2 + size / 8, { align: "center" });

    if (value) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.text(
        value,
        x + labelColW + (leftW - labelColW) / 2,
        ry + rowH / 2 + 3,
        { align: "center" },
      );
    }
  });
}