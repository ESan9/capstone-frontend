import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";
import ProductList from "./components/ProductList";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      {/* Il Provider dell'Auth avvolge tutto*/}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />

        <main className="flex-grow">
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <Routes>
              {/* Rotte Pubbliche */}
              <Route path="/" element={<ProductList />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Next:
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/admin" element={<AdminPage />} /> 
              */}
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
