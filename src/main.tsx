import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; 

// ルート要素を確認し、存在しない場合は作成する
let rootElement = document.getElementById("root");

// rootElementが存在しない場合、動的に作成
if (!rootElement) {
  console.log("Root element not found, creating one...");
  rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
}

// アプリをレンダリング
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);