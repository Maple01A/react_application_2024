import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Home } from "./pages/home";


// レイアウトコンポーネントを分離
const Layout: React.FC = () => {
    return (
        <div className="main-layout">
            <header className="header">
                <h1>予定管理アプリ</h1>
            </header>
            <main className="content">
                <Outlet /> {/* ここでネストされたルートのコンポーネントが表示される */}
            </main>
            <footer className="footer">
                <p>© {new Date().getFullYear()} 予定管理アプリ</p>
            </footer>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* ネストされたルート - Layoutコンポーネント内のOutletに表示される */}
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;