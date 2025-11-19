"use client";
import logo from "../assets/SegnaliLogo.png";

import { useState, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import type { Category } from "../types/api";
import { fetchCategories } from "../services/api";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utility check per admin
  const isAdmin = user?.roles.some((r) => r.role === "ADMIN");

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        {/* LOGO */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-x-2">
            <img alt="Logo Negozio" src={logo} className="h-8 w-auto" />
            <span className="font-semibold text-gray-900">Segnali</span>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
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

        {/* DESKTOP MENU CENTRALE */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:underline focus-visible:outline-none cursor-pointer">
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
                {loadingCategories && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Caricamento...
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
            Contatti e dove trovarci
          </Link>
        </PopoverGroup>

        {/* DESKTOP UTENTE / LOGIN */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4 items-center">
          {isLoading ? (
            <div className="h-6 w-24 animate-pulse bg-gray-200 rounded-md" />
          ) : user ? (
            // --- DROPDOWN UTENTE DESKTOP ---
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="flex items-center gap-x-2 rounded-full bg-white text-sm focus:outline-none p-1 pr-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <span className="sr-only">Apri menu utente</span>
                  <UserCircleIcon
                    className="h-8 w-8 text-gray-900"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-gray-900">
                    Ciao, {user.name}
                  </span>
                  <ChevronDownIcon
                    className="h-4 w-4 text-gray-500"
                    aria-hidden="true"
                  />
                </MenuButton>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {/* Link Admin - Solo se admin */}
                  {isAdmin && (
                    <MenuItem>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100 data-[focus]:bg-gray-100"
                      >
                        Dashboard Admin
                      </Link>
                    </MenuItem>
                  )}
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 data-[focus]:bg-gray-100"
                    >
                      Logout
                    </button>
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          ) : (
            // --- LOGIN / REGISTER DESKTOP ---
            <>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
              >
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE MENU DIALOG */}
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
                    {!loadingCategories &&
                      categories.map((item) => (
                        <DisclosureButton
                          key={item.idCategory}
                          as={Link}
                          to={`/category/${item.slug}`}
                          className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </DisclosureButton>
                      ))}
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

                {/* LINK ADMIN MOBILE */}
                {user && isAdmin && (
                  <Link
                    to="/admin"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-bold leading-7 text-gray-900 bg-gray-100 mt-4 border-l-4 border-black"
                  >
                    Dashboard Admin
                  </Link>
                )}
              </div>
              <div className="py-6">
                {isLoading ? null : user ? (
                  <button
                    onClick={handleLogout}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-600 hover:bg-gray-50 w-full text-left"
                  >
                    Logout ({user.name})
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
