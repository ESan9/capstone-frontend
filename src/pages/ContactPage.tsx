import { PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function ContactPage() {
  const CONTACT_EMAIL = "sannagianmario894@gmail.com";

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Contattaci
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Siamo a disposizione per qualsiasi informazione sui nostri prodotti
            artigianali. Scrivici o vieni a trovarci in negozio.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* BOX 1: INDIRIZZO */}
          <div>
            <h3 className="border-l-4 border-black pl-6 font-semibold text-gray-900">
              Dove siamo
            </h3>
            <address className="border-l-4 border-gray-200 pl-6 pt-2 not-italic text-gray-600">
              <div className="flex gap-x-2 items-start">
                <MapPinIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <p>Piazza Eleonora 22</p>
                  <p>09170, Oristano (OR)</p>
                </div>
              </div>
            </address>
          </div>

          {/* BOX 2: TELEFONO (Opzionale) */}
          <div>
            <h3 className="border-l-4 border-black pl-6 font-semibold text-gray-900">
              Telefono
            </h3>
            <div className="border-l-4 border-gray-200 pl-6 pt-2 text-gray-600">
              <div className="flex gap-x-2 items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <p>+39 0783 301884</p>
              </div>
            </div>
          </div>

          {/* BOX 3: EMAIL */}
          <div>
            <h3 className="border-l-4 border-black pl-6 font-semibold text-gray-900">
              Scrivici
            </h3>
            <div className="border-l-4 border-gray-200 pl-6 pt-2 text-gray-600">
              <div className="flex gap-x-2 items-center mb-4">
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Informazioni%20Segnali&body=Salve,%20vorrei%20informazioni%20riguardo...`}
                  className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Invia una Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
