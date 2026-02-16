import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProveedoresPage from "../pages/ProveedoresPage";
import SucursalesPage from "../pages/SucursalesPage";
import ComposicionesPage from "./ComposicionesPage";
import NuevaComposicionPage from "./NuevaComposicionPage";
import { checkPermiso } from "../helpers/permisosHelper";

export default function DashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [permisos, setPermisos] = useState<any[]>(() => {
        const saved = sessionStorage.getItem("permisos");
        return saved ? JSON.parse(saved) : [];
    });

    const [pestañas, setPestañas] = useState([
        { id: "inicio", titulo: "Inicio", icono: "🏠" },
    ]);
    const [pestañaActiva, setPestañaActiva] = useState("inicio");
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const userEmail = sessionStorage.getItem("userEmail") || "";

    useEffect(() => {
        const path = location.pathname;
        if (path === "/dashboard/composiciones/nueva") {
            setPestañaActiva("nueva-composicion");
            if (!pestañas.find(p => p.id === "nueva-composicion")) {
                setPestañas(prev => [...prev, { id: "nueva-composicion", titulo: "Nueva Comp.", icono: "🪄" }]);
            }
        } else if (path === "/dashboard/composiciones") {
            setPestañaActiva("composiciones");
            if (!pestañas.find(p => p.id === "composiciones")) {
                setPestañas(prev => [...prev, { id: "composiciones", titulo: "Composiciones", icono: "🪄" }]);
            }
        } else if (path === "/dashboard") {
            setPestañaActiva("inicio");
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleClickFuera = (event: MouseEvent) => {
            if (menuAbierto && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setMenuAbierto(null);
            }
        };
        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, [menuAbierto]);

    useEffect(() => {
        const inicializarDashboard = async () => {
            const token = sessionStorage.getItem("token");
            if (!token || !userEmail) {
                navigate("/login", { replace: true });
                return;
            }
            
            const hora = new Date().getHours();
            setIsDark(hora >= 20 || hora < 10);

            try {
                const response = await fetch(
                    "http://localhost:3000/api/login/obtener-permisos",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ correo: userEmail }),
                    },
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const listaPermisos = data.data || data || [];
                    setPermisos(listaPermisos);
                    sessionStorage.setItem("permisos", JSON.stringify(listaPermisos));
                }
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };
        inicializarDashboard();
    }, [navigate, userEmail]);

    const getIcon = (nombre: string) => {
        const mapa: { [key: string]: string } = {
            Catalogos: "📂", Reportes: "📊", Mercancia: "📦",
            Administrador: "🛡️", Productos: "🏷️", Proveedores: "🚚",
            Sucursales: "🏢", Permisos: "🔑", Composiciones: "🪄",
        };
        return mapa[nombre] || "🗃️";
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login", { replace: true });
    };

    const abrirPestaña = (idModulo: number, titulo: string, icono: string) => {
        if (!checkPermiso(idModulo, 'Visualizar')) {
            alert("🚫 Acceso denegado: No tienes permisos para este módulo.");
            return;
        }

        const tabId = titulo.toLowerCase().replace(/\s+/g, "-");
        if (!pestañas.find((p) => p.id === tabId)) {
            setPestañas([...pestañas, { id: tabId, titulo, icono }]);
        }
        setPestañaActiva(tabId);
        setMenuAbierto(null);
        
        if (tabId === "composiciones") navigate("/dashboard/composiciones");
    };

    const cerrarPestaña = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (id === "inicio") return;

        const nuevasPestañas = pestañas.filter((p) => p.id !== id);
        setPestañas(nuevasPestañas);

        if (pestañaActiva === id) {
            setPestañaActiva("inicio");
            navigate("/dashboard", { replace: true });
        }
    };

    const theme = {
        bg: isDark ? "bg-slate-950 text-white" : "bg-[#E6ECF7] text-slate-900",
        sidebar: isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-blue-100 shadow-2xl",
        tabBar: isDark ? "bg-slate-900/50 border-slate-800" : "bg-blue-200/30 border-blue-200/50",
        tabActive: isDark ? "bg-sky-600 text-white shadow-lg shadow-sky-900/40" : "bg-white text-sky-600 shadow-sm border-blue-100",
        tabInactive: isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-sky-600",
        contentCard: isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-white shadow-sm",
        popover: isDark ? "bg-slate-900 border-slate-700 shadow-black" : "bg-white border-white shadow-slate-200",
    };

    if (loading && permisos.length === 0) {
        return (
            <div className={`h-screen w-full flex flex-col items-center justify-center ${isDark ? "bg-slate-950" : "bg-[#E6ECF7]"}`}>
                <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600">Iniciando SisCoIn...</p>
            </div>
        );
    }

    return (
        <div className={`flex h-screen font-segoe overflow-hidden ${theme.bg}`}>
            <aside ref={sidebarRef} className={`w-20 border-r flex flex-col items-center py-8 z-50 ${theme.sidebar}`}>
                <div className="mb-12 cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/40 text-xl italic">S</div>
                </div>

                <nav className="flex-1 space-y-8">
                    {permisos.filter((p) => !p.IdModuloPadre && p.Visualizar).map((padre) => (
                        <div key={padre.IdModulo} className="relative group">
                            <button
                                onClick={() => setMenuAbierto(prev => prev === padre.ModuloNombre ? null : padre.ModuloNombre)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${menuAbierto === padre.ModuloNombre ? "bg-sky-500 text-white shadow-lg scale-110" : "hover:bg-sky-500/10 text-slate-400"}`}
                            >
                                {getIcon(padre.ModuloNombre)}
                            </button>

                            {menuAbierto === padre.ModuloNombre && (
                                <div className={`absolute left-20 top-0 w-64 overflow-hidden rounded-4xl border backdrop-blur-3xl z-60 animate-in fade-in zoom-in-95 duration-200 ${theme.popover}`}>
                                    <div className={`px-5 py-4 border-b ${isDark ? "bg-sky-500/10 border-white/5" : "bg-sky-50 border-blue-50"}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{getIcon(padre.ModuloNombre)}</span>
                                            <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-sky-400" : "text-sky-600"}`}>{padre.ModuloNombre}</h3>
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {permisos.filter((h) => h.IdModuloPadre === padre.IdModulo && h.Visualizar).map((hijo) => (
                                            <button
                                                key={hijo.IdModulo}
                                                onClick={() => abrirPestaña(hijo.IdModulo, hijo.ModuloNombre, getIcon(hijo.ModuloNombre))}
                                                className={`w-full group/item flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isDark ? "hover:bg-sky-600" : "hover:bg-sky-500"}`}
                                            >
                                                <span className={`font-bold text-[12px] transition-colors ${isDark ? "text-slate-300 group-hover/item:text-white" : "text-slate-600 group-hover/item:text-white"}`}>{hijo.ModuloNombre}</span>
                                                <span className="opacity-0 group-hover/item:opacity-100 transition-all text-white text-[10px]">→</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <button onClick={handleLogout} className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-500/10 mt-auto transition-colors">✕</button>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="px-12 pt-8 pb-4">
                    <div className={`inline-flex items-center p-1.5 rounded-2xl border ${theme.tabBar}`}>
                        {pestañas.map((p) => {
                            const isActive = pestañaActiva === p.id || (p.id === "composiciones" && pestañaActiva === "nueva-composicion");
                            return (
                                <div key={p.id} onClick={() => { setPestañaActiva(p.id); navigate(p.id === "inicio" ? "/dashboard" : (p.id === "nueva-composicion" ? "/dashboard/composiciones/nueva" : `/dashboard/${p.id}`)); }} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-wider transition-all min-w-32 justify-center ${isActive ? theme.tabActive : theme.tabInactive}`}>
                                    <span>{p.icono}</span> <span className="truncate">{p.titulo}</span>
                                    {p.id !== "inicio" && <button onClick={(e) => cerrarPestaña(e, p.id)} className={`ml-1 w-4 h-4 rounded-md flex items-center justify-center text-[8px] ${isActive ? "bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600" : "hover:bg-blue-200 text-blue-400"}`}>✕</button>}
                                </div>
                            );
                        })}
                    </div>
                </header>

                <main className="flex-1 px-8 pb-8 overflow-hidden relative">
                    <div className={`w-full h-full rounded-[3rem] p-12 relative overflow-y-auto overflow-x-hidden ${theme.contentCard}`}>
                        {pestañaActiva === "inicio" && (
                            <div className="min-h-full w-full flex flex-col items-center justify-center relative py-12">
                                {/* CAPA DE FONDO */}
                                <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden">
                                    <div className={`absolute w-125 h-125 rounded-full blur-[120px] opacity-20 ${isDark ? "bg-sky-500" : "bg-blue-400"}`}></div>
                                    <div className="absolute w-100 h-100 border border-sky-500/10 rounded-full animate-[spin_40s_linear_infinite]"></div>
                                    <div className="relative grid grid-cols-2 gap-10 opacity-[0.05] -rotate-12 scale-150">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`w-32 h-32 rounded-[2.5rem] border-2 ${isDark ? "border-white" : "border-sky-500"}`}></div>
                                        ))}
                                    </div>
                                </div>

                                {/* CAPA DE CONTENIDO */}
                                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
                                    <div className="mb-16 px-6 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-[10px] font-black uppercase tracking-[0.4em] shadow-sm">
                                        SisCoIn Warehouse Management
                                    </div>

                                    <div className="relative h-48 flex flex-col items-center justify-center mb-10">
                                        <div className="w-40 h-40 rounded-[3.5rem] bg-linear-to-br from-sky-500 to-indigo-600 shadow-[0_30px_60px_-10px_rgba(14,165,233,0.4)] flex items-center justify-center animate-bounce duration-3000">
                                            <span className="text-7xl">📦</span>
                                        </div>
                                        <div className="absolute -bottom-2 w-20 h-2 bg-black/10 blur-xl rounded-full scale-x-150 animate-pulse"></div>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <h2 className={`text-7xl md:text-8xl font-black italic tracking-tighter leading-none uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                                            Hola, <br /> <span className="text-sky-600">Bienvenido</span>
                                        </h2>
                                        <p className="text-lg font-medium max-w-lg mx-auto opacity-40 leading-relaxed">
                                            Plataforma técnica para la gestión inteligente <br /> de inventarios y activos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {pestañaActiva === "proveedores" && <ProveedoresPage isDark={isDark} />}
                        {pestañaActiva === "sucursales" && <SucursalesPage isDark={isDark} />}
                        {pestañaActiva === "composiciones" && <ComposicionesPage isDark={isDark} />}
                        {pestañaActiva === "nueva-composicion" && <NuevaComposicionPage isDark={isDark} />}
                    </div>
                </main>
            </div>
        </div>
    );
}