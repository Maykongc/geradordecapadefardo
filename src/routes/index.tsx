import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Etiqueta de Expedição" },
      { name: "description", content: "Etiqueta de separação e expedição — ROTA, CS, REAB, FARDO" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl border-2 border-black">
        {/* Header */}
        <div className="bg-[#7cb342] border-b-2 border-black py-4 px-6">
          <h1 className="text-center font-black text-5xl tracking-tight text-black">
            ROTA(&nbsp;&nbsp;&nbsp;) CS(&nbsp;&nbsp;&nbsp;) REAB(&nbsp;&nbsp;&nbsp;)
          </h1>
        </div>

        {/* Body grid: left column (labels + values) | right column (ETIQUETA / FARDO) */}
        <div className="grid grid-cols-[1fr_320px]">
          {/* Left side */}
          <div className="border-r-2 border-black flex flex-col">
            {/* Empty top cell */}
            <div className="h-[280px] border-b-2 border-black" />

            {/* Label rows */}
            <LabelRow label="SEPARAÇÃO" big />
            <LabelRow label="PEDIDO" />
            <LabelRow label="QT CHPs" />
            <LabelRow label="MATRICULA SEPARADOR" small />
            <LabelRow label="DOCA EXPEDIÇÃO" last />
          </div>

          {/* Right side */}
          <div className="flex flex-col">
            <div className="flex-1 flex items-center justify-center border-b-2 border-black min-h-[280px]">
              <span className="font-black text-4xl text-black">ETIQUETA</span>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <span className="font-black text-6xl text-black">FARDO</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LabelRow({
  label,
  big,
  small,
  last,
}: {
  label: string;
  big?: boolean;
  small?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_1fr] ${last ? "" : "border-b-2 border-black"}`}
    >
      <div
        className={`flex items-center justify-center py-4 px-4 border-r-2 border-black font-black text-black ${
          big ? "text-3xl" : small ? "text-xl" : "text-2xl"
        }`}
      >
        {label}
      </div>
      <div className="min-h-[70px]" />
    </div>
  );
}
