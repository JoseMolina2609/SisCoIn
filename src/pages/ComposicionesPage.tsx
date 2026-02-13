import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkPermiso } from "../helpers/permisosHelper"; // Importamos el helper

interface Composicion {
    idComposicion: number;
    colorId: number;
    color: string;
    tallaId: number;
    nombreTalla: string;
    unidadMedidaId: number;
    nombreMedida: string;
    abreviaturaMedida: string;
    tipoId: number;
    nombreTipo: string;
}

const ComposicionesPage = ({ isDark }: { isDark: boolean }) => {
    const navigate = useNavigate();
    const [composiciones, setComposiciones] = useState<Composicion[]>([]);
    const [loading, setLoading] = useState(true);

    // Verificamos el permiso de insertar para el módulo 13 (Composiciones)
    const puedeInsertar = checkPermiso(13, 'Insertar');

    const [filters, setFilters] = useState({
        color: "",
        talla: "",
        medida: "",
        tipo: "",
    });

    useEffect(() => {
        const fetchComposiciones = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    "http://localhost:3000/api/catalogos/composiciones/lista",
                );
                const json = await response.json();
                if (json.ResultCode === 0) setComposiciones(json.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComposiciones();
    }, []);

    const getUniqueOptions = (key: keyof Composicion) => {
        const options = Array.from(new Set(composiciones.map((item) => item[key])));
        return options.sort();
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const filteredData = composiciones.filter((c) => {
        return (
            (filters.color === "" || c.color === filters.color) &&
            (filters.talla === "" || c.nombreTalla === filters.talla) &&
            (filters.medida === "" || c.nombreMedida === filters.medida) &&
            (filters.tipo === "" || c.nombreTipo === filters.tipo)
        );
    });

    const selectClass = `w-full bg-transparent text-[10px] font-black tracking-widest outline-none py-1 appearance-none cursor-pointer transition-all text-white focus:text-cyan-300`;

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex justify-between items-end px-2">
                <div>
                    <h2
                        className={`text-4xl font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                        CATALOGO{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 inline-block pr-3">
                            DE COMPOSICIONES
                        </span>
                    </h2>
                    <p className="text-sky-500 text-[9px] font-black uppercase tracking-[0.5em] mt-1">
                        Control de Inventario Maestro
                    </p>
                </div>

                {/* BOTÓN AÑADIR - Solo se muestra si puedeInsertar es true */}
                {puedeInsertar && (
                    <button
                        onClick={() => navigate("/dashboard/composiciones/nueva")}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                    >
                        <span className="text-sm font-bold">+</span> Añadir Composición
                    </button>
                )}
            </div>

            {/* BLOQUE DE FILTROS AZUL */}
            <div className="grid grid-cols-12 px-8 py-5 rounded-[2rem] shadow-xl shadow-sky-500/10 border border-sky-400/20 bg-gradient-to-r from-sky-600 to-indigo-700 items-center">
                <div className="col-span-11 grid grid-cols-4 gap-8">
                    {/* COMBO COLOR */}
                    <div className="border-r border-white/10 pr-4">
                        <p className="text-[8px] font-black text-sky-200/60 mb-1 tracking-[0.2em] uppercase">
                            Color
                        </p>
                        <select
                            name="color"
                            value={filters.color}
                            onChange={handleFilterChange}
                            className={selectClass}
                        >
                            <option value="" className="text-slate-900">
                                TODOS
                            </option>
                            {getUniqueOptions("color").map((opt) => (
                                <option key={opt} value={opt} className="text-slate-900">
                                    {String(opt).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* COMBO TALLA */}
                    <div className="border-r border-white/10 pr-4">
                        <p className="text-[8px] font-black text-sky-200/60 mb-1 tracking-[0.2em] uppercase">
                            Talla
                        </p>
                        <select
                            name="talla"
                            value={filters.talla}
                            onChange={handleFilterChange}
                            className={selectClass}
                        >
                            <option value="" className="text-slate-900">
                                TODAS
                            </option>
                            {getUniqueOptions("nombreTalla").map((opt) => (
                                <option key={opt} value={opt} className="text-slate-900">
                                    {String(opt).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* COMBO MEDIDA */}
                    <div className="border-r border-white/10 pr-4">
                        <p className="text-[8px] font-black text-sky-200/60 mb-1 tracking-[0.2em] uppercase">
                            Unidad
                        </p>
                        <select
                            name="medida"
                            value={filters.medida}
                            onChange={handleFilterChange}
                            className={selectClass}
                        >
                            <option value="" className="text-slate-900">
                                TODAS
                            </option>
                            {getUniqueOptions("nombreMedida").map((opt) => (
                                <option key={opt} value={opt} className="text-slate-900">
                                    {String(opt).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* COMBO TIPO */}
                    <div className="pr-4">
                        <p className="text-[8px] font-black text-sky-200/60 mb-1 tracking-[0.2em] uppercase">
                            Tipo
                        </p>
                        <select
                            name="tipo"
                            value={filters.tipo}
                            onChange={handleFilterChange}
                            className={selectClass}
                        >
                            <option value="" className="text-slate-900">
                                TODOS
                            </option>
                            {getUniqueOptions("nombreTipo").map((opt) => (
                                <option key={opt} value={opt} className="text-slate-900">
                                    {String(opt).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* BOTÓN RESETEAR ADENTRO DEL BLOQUE */}
                <div className="col-span-1 flex justify-end">
                    <button
                        onClick={() =>
                            setFilters({ color: "", talla: "", medida: "", tipo: "" })
                        }
                        title="Limpiar Filtros"
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 shadow-inner"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* LISTADO DE RESULTADOS */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 pr-2">
                {loading ?
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                    </div>
                :   <div className="space-y-2">
                        {filteredData.map((c, index) => (
                            <div
                                key={c.idComposicion}
                                style={{ animationDelay: `${index * 20}ms` }}
                                className={`grid grid-cols-12 items-center px-8 py-3.5 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-left-4 group ${
                                    isDark ?
                                        "bg-slate-900/40 border-slate-800/50 hover:bg-slate-800 hover:border-sky-500/50 hover:translate-x-1"
                                    :   "bg-white border-slate-100 shadow-sm hover:border-sky-200 hover:translate-x-1"
                                }`}
                            >
                                <div className="col-span-1 font-mono text-[10px] font-bold text-slate-500 italic opacity-40">
                                    #{c.idComposicion}
                                </div>
                                <div
                                    className={`col-span-3 text-[12px] font-black uppercase italic tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}
                                >
                                    {c.color}
                                </div>
                                <div
                                    className={`col-span-2 text-[11px] font-black ${isDark ? "text-slate-400" : "text-slate-600"}`}
                                >
                                    {c.nombreTalla}
                                </div>
                                <div className="col-span-3 flex items-center gap-3">
                                    <span className="text-[8px] font-black text-sky-500 bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10 uppercase">
                                        {c.abreviaturaMedida}
                                    </span>
                                    <span
                                        className={`text-[10px] font-bold truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                    >
                                        {c.nombreMedida}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span
                                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isDark ? "bg-slate-800/50 text-slate-500" : "bg-slate-50 text-slate-400"}`}
                                    >
                                        {c.nombreTipo}
                                    </span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <button className="opacity-0 group-hover:opacity-100 transition-all text-sm hover:scale-125">
                                        ⚡
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
};

export default ComposicionesPage;