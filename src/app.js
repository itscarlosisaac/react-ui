import React from "react";
import ReactDOM from "react-dom";
import AppRouter from "./routes/app.router";

// Import CSS
import "normalize.css/normalize.css";
import "./styles/master.scss";

const root = document.getElementById("app");

ReactDOM.render(<AppRouter />, root);
