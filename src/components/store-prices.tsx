interface StorePrice {
  chain: string;
  price: number;
  date: string;
}

const CHAIN_COLORS: Record<string, string> = {
  Kiwi: "bg-green-500",
  Meny: "bg-purple-500",
  "Rema 1000": "bg-blue-500",
  Spar: "bg-yellow-500",
  Joker: "bg-orange-500",
  Oda: "bg-cyan-500",
  Bunnpris: "bg-red-500",
  "Coop Extra": "bg-pink-500",
  "Coop Mega": "bg-pink-600",
  "Coop Obs": "bg-pink-700",
  "Coop Prix": "bg-pink-400",
};

export function StorePrices({ prices }: { prices: StorePrice[] }) {
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0]?.price;

  return (
    <div className="bg-surface rounded-xl p-5">
      <h3 className="text-white font-semibold mb-3">Pris i butikker nå</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((p) => (
          <div key={p.chain} className="flex items-center justify-between bg-surface-hover px-3 py-2.5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white ${CHAIN_COLORS[p.chain] || "bg-gray-500"}`}>
                {p.chain[0]}
              </div>
              <span className="text-gray-300 text-sm">{p.chain}</span>
            </div>
            <span className={`text-base font-semibold ${p.price === cheapest ? "text-green-500" : "text-white"}`}>
              {p.price.toFixed(2)} kr
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
