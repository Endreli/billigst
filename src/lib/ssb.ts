const SSB_API_URL = "https://data.ssb.no/api/v0/no/table/03013";

interface SsbQueryBody {
  query: { code: string; selection: { filter: string; values: string[] } }[];
  response: { format: string };
}

interface SsbJsonStat {
  dataset: {
    dimension: {
      Tid: { category: { index: Record<string, number>; label: Record<string, string> } };
    };
    value: number[];
  };
}

export interface CpiDataPoint {
  year: number;
  month: number;
  value: number;
}

export async function fetchCpiData(fromYear = 2020): Promise<CpiDataPoint[]> {
  const query: SsbQueryBody = {
    query: [
      {
        code: "Konsumgrp",
        selection: { filter: "item", values: ["TOTAL"] },
      },
      {
        code: "ContentsCode",
        selection: { filter: "item", values: ["KpiIndMnd"] },
      },
      {
        code: "Tid",
        selection: {
          filter: "agg:TidMaaneder10",
          values: Array.from({ length: 2027 - fromYear }, (_, i) =>
            String(fromYear + i)
          ).flatMap((y) =>
            Array.from({ length: 12 }, (_, m) =>
              `${y}M${String(m + 1).padStart(2, "0")}`
            )
          ),
        },
      },
    ],
    response: { format: "json-stat" },
  };

  const res = await fetch(SSB_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });

  if (!res.ok) throw new Error(`SSB API error: ${res.status}`);

  const json: SsbJsonStat = await res.json();
  const tidIndex = json.dataset.dimension.Tid.category.index;
  const values = json.dataset.value;

  return Object.entries(tidIndex)
    .sort(([, a], [, b]) => a - b)
    .map(([key, idx]) => {
      const [yearStr, monthStr] = key.split("M");
      return {
        year: parseInt(yearStr),
        month: parseInt(monthStr),
        value: values[idx],
      };
    })
    .filter((d) => d.value != null && !isNaN(d.value));
}
