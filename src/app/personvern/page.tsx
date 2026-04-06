import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvern — Billigst",
  description: "Personvernerklæring for Billigst-appen.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personvernerklæring</h1>
        <p className="text-text-muted text-[15px] mt-2">Sist oppdatert: April 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Hva er Billigst?</h2>
        <p className="text-text-muted text-[15px] leading-relaxed">
          Billigst er en prissammenligningsapp for norske dagligvarer. Appen hjelper deg
          med å finne den billigste butikken for handlekurven din.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Hvilke data samler vi inn?</h2>
        <div className="space-y-4 text-text-muted text-[15px] leading-relaxed">
          <div>
            <h3 className="text-white font-medium">Handlekurv</h3>
            <p>Handlekurven din lagres kun lokalt på din enhet (localStorage). Vi sender aldri
            handlekurven din til noen server eller tredjepart.</p>
          </div>
          <div>
            <h3 className="text-white font-medium">Posisjon</h3>
            <p>Hvis du aktiverer posisjonstjenester, brukes posisjonen din kun til å finne
            butikker i nærheten. Posisjonen sendes direkte til OpenStreetMap (Overpass API)
            for å finne butikker, og til OSRM for å beregne kjøreruter. Vi lagrer ikke
            posisjonen din på noen server.</p>
          </div>
          <div>
            <h3 className="text-white font-medium">Søk</h3>
            <p>Produktsøk sendes til vår server for å hente resultater fra databasen.
            Vi logger ikke søkene dine knyttet til noen brukeridentitet.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Tredjeparts-tjenester</h2>
        <div className="text-text-muted text-[15px] leading-relaxed space-y-2">
          <p><span className="text-white">Kassalapp</span> — Vi henter prisdata fra Kassalapp.app sine API-er.</p>
          <p><span className="text-white">OpenStreetMap</span> — Brukes til å finne butikker i nærheten (Overpass API).</p>
          <p><span className="text-white">OSRM</span> — Brukes til å beregne kjøreruter og kjøretid.</p>
          <p><span className="text-white">Vercel</span> — Appen hostes på Vercel sin plattform.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Informasjonskapsler (cookies)</h2>
        <p className="text-text-muted text-[15px] leading-relaxed">
          Billigst bruker ikke informasjonskapsler for sporing. Vi bruker kun localStorage
          for å lagre handlekurven din og innstillinger lokalt på din enhet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Dine rettigheter</h2>
        <p className="text-text-muted text-[15px] leading-relaxed">
          Siden vi ikke samler inn personopplysninger, er det ingen data å slette.
          Du kan når som helst tømme handlekurven din og fjerne alle lokale data
          ved å slette nettleserdata for denne appen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Kontakt</h2>
        <p className="text-text-muted text-[15px] leading-relaxed">
          Har du spørsmål om personvern? Kontakt oss på kontakt@billigst.no.
        </p>
      </section>
    </div>
  );
}
