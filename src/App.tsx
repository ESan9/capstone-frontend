import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";
import HomePage from "./pages/HomePage";
import ProductList from "./components/ProductList";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CategoryListPage from "./pages/CategoryListPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* HOME & CATALOGO */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ProductList />} />
            <Route path="/category/:slug" element={<ProductList />} />
            <Route path="/categories" element={<CategoryListPage />} />

            {/* DETTAGLIO PRODOTTO */}
            <Route path="/product/:slug" element={<ProductDetailPage />} />

            {/* INFO */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* AUTH */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ADMIN */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
