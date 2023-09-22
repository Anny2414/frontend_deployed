import React from "react";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar.jsx";

import "../App.css"

export function HomePage() {
  return <div className="main-container">
    <Navbar />
    <Footer/>
  </div>
}
