import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PaginaSincronizar from "./pages/PaginaSincronizar";
import Dashboard from "./pages/DashboardPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    // Si no hay token en el almacenamiento local, no hay paso.
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Al entrar a http://localhost:5173/ te manda a /login automáticamente */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                <Route path="/login" element={<LoginPage />} />

                {/* 2. Rutas protegidas: Solo entran si hay token */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/composiciones" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/composiciones/nueva" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                <Route path="/sincronizar" element={<ProtectedRoute><PaginaSincronizar /></ProtectedRoute>} />

                {/* 3. Si escriben cualquier cosa loca en la URL, al login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;