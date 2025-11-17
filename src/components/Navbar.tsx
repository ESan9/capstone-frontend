"use client";
// Assicurati di aver creato 'src/assets' e di averci messo 'SegnaliLogo.png'
import logo from "../assets/SegnaliLogo.png";

import { useState, useEffect } from "react";
// Importiamo Link per la navigazione
import { Link, useNavigate } from "react-router-dom";
// Importiamo il nostro "cervello" Auth
import { useAuth } from "../hooks/useAuth";

import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// Importiamo i tipi e le funzioni API
import type { Category } from "../types/api";
import { fetchCategories } from "../services/api";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Usiamo il contesto Auth
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Stato per le categorie
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carichiamo le categorie al mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError(null);
        const response = await fetchCategories();
        setCategories(response.content);
      } catch (err) {
        setError("Impossibile caricare le categorie.");
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Funzione per gestire il logout
  const handleLogout = () => {
    logout();
    navigate("/"); // Ritorna alla homepage dopo il logout
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          {/* Usiamo <Link> per il logo */}
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-x-2">
            <img alt="Logo Negozio" src={logo} className="h-8 w-auto" />
            <span className="font-semibold text-gray-900">Segnali</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:underline focus-visible:outline-none">
              Categorie
              <ChevronDownIcon
                aria-hidden="true"
                className="h-5 w-5 flex-none text-gray-400"
              />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[enter]:ease-out data-[leave]:duration-150 data-[leave]:ease-in"
            >
              <div className="p-4">
                {/* Gestione stati di caricamento per le categorie */}
                {loadingCategories && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Caricamento...
                  </div>
                )}
                {error && (
                  <div className="p-4 text-center text-sm text-red-600">
                    {error}
                  </div>
                )}
                {!loadingCategories &&
                  !error &&
                  categories.map((item) => (
                    <div
                      key={item.idCategory}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <img
                          src={item.coverImageUrl}
                          alt={item.name}
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-auto">
                        <Link
                          to={`/category/${item.slug}`}
                          className="block font-semibold text-gray-900"
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </PopoverPanel>
          </Popover>

          {/* Usiamo <Link> per i link di navigazione */}
          <Link
            to="/about"
            className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
          >
            La nostra storia
          </Link>
          <Link
            to="/contact"
            className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
          >
            Contatti
          </Link>
        </PopoverGroup>

        {/* LOGICA DI AUTENTICAZIONE */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4 items-center">
          {isLoading ? (
            // Placeholder mentre si controlla l'auth
            <div className="h-6 w-24 animate-pulse bg-gray-200 rounded-md" />
          ) : user ? (
            // Se l'utente è loggato
            <>
              <span className="text-sm font-semibold text-gray-700">
                Ciao, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
              >
                Logout <span aria-hidden="true">&rarr;</span>
              </button>
            </>
          ) : (
            // Se l'utente NON è loggato
            <>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-500"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- DIALOG MOBILE --- */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Segnali</span>
              <img alt="" src={logo} className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Chiudi menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Categorie
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 flex-none group-data-[open]:rotate-180"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {loadingCategories ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Caricamento...
                      </div>
                    ) : (
                      categories.map((item) => (
                        <DisclosureButton
                          key={item.idCategory}
                          as={Link} // Usa Link qui
                          to={`/category/${item.slug}`}
                          className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </DisclosureButton>
                      ))
                    )}
                  </DisclosurePanel>
                </Disclosure>
                <Link
                  to="/about"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  La nostra storia
                </Link>
                <Link
                  to="/contact"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Contatti
                </Link>
              </div>
              {/* Auth mobile */}
              <div className="py-6">
                {isLoading ? null : user ? (
                  <button
                    onClick={handleLogout}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Accedi
                    </Link>
                    <Link
                      to="/register"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Registrati
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
