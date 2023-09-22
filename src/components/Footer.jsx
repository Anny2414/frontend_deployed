import React from "react";

function Footer() {
  const footerStyle = {
    backgroundColor: "#1F1E1E",
    color: "white",
    padding: "5px 0",
    textAlign: "center",
    position: "absolute",
    bottom: "0",
    width: "100%",
  };

  return (
    <footer style={footerStyle}>
      <div className="columns footer-content ">
        <div className="column">
        </div>
        <div className="column">
          <p>Auntie´s Burger</p>
            
          <ul className="footer-links">
            <li>
              <a href="#">Contáctenos</a>
            </li>
          </ul>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
        <div className="column">
        </div>
      </div>
    </footer>
  );
}

export default Footer;
