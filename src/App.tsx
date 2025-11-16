import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";
import ProductList from "./components/ProductList";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {/* 2. Definisco le rotte */}
            <Routes>
              {/* La rotta "/" (homepage) mostra la lista dei prodotti */}
              <Route path="/" element={<ProductList />} />

              {/* Aggiungerò le altre rotte (es. /product/:slug) qui */}
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
