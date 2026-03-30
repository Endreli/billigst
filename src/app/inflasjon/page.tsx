import { prisma } from "@/lib/db";

export default async function InflationPage() {
  const cpiData = await prisma.cpiData.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inflasjon i Norge</h1>
      <p className="text-gray-500 text-sm">
        Konsumprisindeksen (KPI) fra SSB — viser generell prisutvikling over tid.
      </p>
      <div className="bg-surface rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">KPI-utvikling</h3>
        {cpiData.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            Ingen KPI-data tilgjengelig ennå. Kjør CPI cron-jobben for å hente data.
          </p>
        ) : (
          <div className="text-gray-400 text-sm">
            <p>Siste KPI: {Number(cpiData[cpiData.length - 1].value).toFixed(1)} ({cpiData[cpiData.length - 1].year}-{String(cpiData[cpiData.length - 1].month).padStart(2, "0")})</p>
            <p className="mt-1 text-gray-600">Fullstendig graf kommer snart.</p>
          </div>
        )}
      </div>
    </div>
  );
}
