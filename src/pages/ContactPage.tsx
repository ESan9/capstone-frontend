import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // API per inviare la mail?
  };

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-16 md:flex md:max-w-none md:space-y-0 md:space-x-12">
          {/* INFO CONTATTO */}
          <div className="flex flex-col justify-between md:w-1/2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Contattaci
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Hai domande su un prodotto o sul negozio? Siamo qui per
                aiutarti. Compila il form o vieni a trovarci.
              </p>

              <div className="mt-10 space-y-4 text-base leading-7 text-gray-600">
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Indirizzo</span>
                  </dt>
                  <dd>
                    Piazza Eleonora 22
                    <br />
                    09170, Oristano (OR)
                  </dd>
                </div>
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Email</span>
                  </dt>
                  <dd>
                    <a
                      className="hover:text-gray-900"
                      href="mailto:info@segnali.it"
                    >
                      info@segnali.it
                    </a>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="md:w-1/2">
            {submitted ? (
              <div className="rounded-md bg-green-50 p-4 text-green-800">
                Grazie per averci contattato! Ti risponderemo al più presto.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Nome
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Messaggio
                  </label>
                  <div className="mt-2.5">
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      required
                      className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="block w-full rounded-md bg-black px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Invia Messaggio
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
