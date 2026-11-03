import { ExternalLink, Thermometer } from "lucide-react";

/** Local presentation only: no request, temperature sample or provider contract. */
export function WaterTemperaturePreview() {
  return (
    <section className="ow-water-preview" aria-labelledby="water-preview-title">
      <div className="ow-water-reading">
        <Thermometer aria-hidden className="h-5 w-5" />
        <div>
          <h2 id="water-preview-title">Température de l’eau</h2>
          <p>Lac de la Gruyère, estimation</p>
        </div>
        <p className="ow-water-value" aria-label="Température non connectée">
          <span>—</span> °C
        </p>
      </div>
      <div className="ow-water-attribution">
        <p>Maquette non connectée</p>
        <a
          href="https://lake.lindt.one/lac-de-la-gruyere/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Courbe et prévisions de l’eau sur lake.lindt.one"
          title="Courbe et prévisions de l’eau sur lake.lindt.one"
        >
          lake.lindt.one
          <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
