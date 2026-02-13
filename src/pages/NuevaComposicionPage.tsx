import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkPermiso } from "../helpers/permisosHelper";

const NuevaComposicionPage = ({ isDark }: { isDark: boolean }) => {
    const navigate = useNavigate();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activePopup, setActivePopup] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // NUEVO ESTADO PARA EL ERROR DE PERMISOS
    const [errorPermiso, setErrorPermiso] = useState<string | null>(null);

    const [catalogos, setCatalogos] = useState({
        colores: [] as any[],
        tallas: [] as any[],
        unidades: [] as any[],
        tipos: [] as any[],
    });

    const [formData, setFormData] = useState({
        id: 0,
        colorId: 0,
        tallaId: 0,
        unidadMedidaId: 0,
        tipoId: 0,
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCatalogos();
        const closeAll = () => { setActiveDropdown(null); setActivePopup(null); };
        window.addEventListener("click", closeAll);
        return () => window.removeEventListener("click", closeAll);
    }, []);

    const fetchCatalogos = async () => {
        try {
            const endpoints = [
                "http://localhost:3000/api/catalogos/colores/lista",
                "http://localhost:3000/api/catalogos/tallas/lista",
                "http://localhost:3000/api/catalogos/unidades-medida/lista",
                "http://localhost:3000/api/catalogos/tipos/lista",
            ];
            const responses = await Promise.all(endpoints.map(url => fetch(url).then(res => res.json())));
            setCatalogos({
                colores: responses[0].data || [],
                tallas: responses[1].data || [],
                unidades: responses[2].data || [],
                tipos: responses[3].data || [],
            });
        } catch (error) { console.error(error); }
    };

    const updateField = (field: string, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleGuardar = async () => {
        // VALIDACIÓN DE PERMISOS PARA GUARDAR
        if (!checkPermiso(13, 'Insertar') || !checkPermiso(13, 'Actualizar')) {
            setErrorPermiso("No cuentas con permisos de escritura (Insertar/Actualizar) para guardar composiciones.");
            return;
        }

        if (!formData.colorId || !formData.tallaId || !formData.unidadMedidaId || !formData.tipoId) {
            alert("⚠️ Selecciona todos los campos antes de guardar.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("http://localhost:3000/api/catalogos/composiciones/guardar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (result.ResultCode === 0) {
                setIsDirty(false);
                navigate("/dashboard/composiciones");
            }
        } catch (e) { alert("Error al guardar"); } finally { setSubmitting(false); }
    };

    const SelectorCard = ({ label, value, options, onChange, icon, type }: any) => {
        const selected = options.find((o: any) => o.id === value);
        const isMenuOpen = activeDropdown === type;
        const isAddOpen = activePopup === type;

        // VALIDACIÓN PARA EL BOTÓN +
        const handleAddClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!checkPermiso(13, 'Insertar') || !checkPermiso(13, 'Actualizar')) {
                setErrorPermiso(`Necesitas el permiso de Insertar y Actualizar para poder añadir registros a:  ${label}.`);
                return;
            }
            setActivePopup(isAddOpen ? null : type);
            setActiveDropdown(null);
        };

        return (
            <div className="flex flex-col gap-2 group" onClick={(e) => e.stopPropagation()}>
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {label}
                </label>
                
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <button
                            type="button"
                            onClick={() => { setActiveDropdown(isMenuOpen ? null : type); setActivePopup(null); }}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all shadow-sm ${
                                isMenuOpen 
                                ? "border-sky-500 ring-4 ring-sky-500/10 scale-[1.02]" 
                                : isDark ? "bg-slate-900 border-white/5 hover:border-white/20" : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{icon}</span>
                                <span className={`font-bold text-xs uppercase ${selected ? (isDark ? "text-sky-400" : "text-sky-600") : "opacity-40"}`}>
                                    {selected ? selected.nombre : "Seleccionar..."}
                                </span>
                            </div>
                            <span className={`text-[10px] transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}>▼</span>
                        </button>

                        {isMenuOpen && (
                            <div className={`absolute top-full left-0 right-0 mt-2 max-h-56 overflow-y-auto rounded-2xl border-2 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}>
                                {options.map((opt: any) => (
                                    <div 
                                        key={opt.id} 
                                        onClick={() => { onChange(opt.id); setActiveDropdown(null); }} 
                                        className={`flex items-center justify-between px-5 py-4 cursor-pointer border-b last:border-0 ${isDark ? "hover:bg-white/5 border-white/5 text-slate-300" : "hover:bg-slate-50 border-slate-50 text-slate-600"}`}
                                    >
                                        <span className="text-xs font-bold uppercase">{opt.nombre}</span>
                                        <span className="text-[9px] font-black opacity-30 px-2 py-1 rounded bg-black/10">ID: {opt.id}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={handleAddClick} 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-lg active:scale-90 ${
                                isAddOpen 
                                ? "bg-sky-500 text-white rotate-45" 
                                : isDark ? "bg-slate-800 text-sky-400 border border-white/5" : "bg-white text-sky-600 border border-slate-200 hover:bg-sky-50"
                            }`}
                        >
                            +
                        </button>

                        {isAddOpen && (
                            <div className={`absolute top-0 right-16 w-64 p-6 rounded-4xl border-2 z-60 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200 ${isDark ? "bg-slate-950 border-sky-500/30" : "bg-white border-slate-100"}`}>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-4">Nuevo {label}</h4>
                                <input 
                                    autoFocus
                                    type="text" 
                                    className={`w-full p-4 rounded-xl border-2 text-xs mb-4 outline-none focus:border-sky-500 ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200"}`}
                                    placeholder="Nombre..."
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setActivePopup(null)} className="flex-1 py-3 text-[9px] font-black uppercase opacity-40">Cerrar</button>
                                    <button className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-[9px] font-black uppercase">Crear</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto space-y-10 pt-10 px-6">
            <div className="flex items-end justify-between border-b pb-6 border-black/5">
                <div className="space-y-2">
                    <button onClick={() => isDirty ? setShowConfirm(true) : navigate("/dashboard/composiciones")} className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:opacity-70 transition-all">← Volver al inventario</button>
                    <h2 className={`text-5xl font-black italic tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                        NUEVA <span className="text-sky-500">COMPOSICIÓN</span>
                    </h2>
                </div>
                <button 
                    onClick={handleGuardar} 
                    disabled={submitting} 
                    className="px-12 py-5 bg-sky-600 text-white rounded-4xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-sky-600/30 hover:-translate-y-1 active:translate-y-0 transition-all"
                >
                    {submitting ? "PROCESANDO..." : "GUARDAR REGISTRO"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                <SelectorCard label="Color" icon="🎨" type="color" value={formData.colorId} options={catalogos.colores} onChange={(id: number) => updateField("colorId", id)} />
                <SelectorCard label="Talla" icon="📏" type="talla" value={formData.tallaId} options={catalogos.tallas} onChange={(id: number) => updateField("tallaId", id)} />
                <SelectorCard label="Unidad" icon="⚖️" type="unidad" value={formData.unidadMedidaId} options={catalogos.unidades} onChange={(id: number) => updateField("unidadMedidaId", id)} />
                <SelectorCard label="Tipo" icon="👞" type="tipo" value={formData.tipoId} options={catalogos.tipos} onChange={(id: number) => updateField("tipoId", id)} />
            </div>

            {/* MODAL DE ERROR DE PERMISOS (ESTILO SISCOIN) */}
            {errorPermiso && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setErrorPermiso(null)}></div>
                    <div className={`relative w-full max-w-sm p-10 rounded-[3rem] border-2 border-red-500/30 shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-pulse">🚫</div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Acción Invalida</h3>
                            <p className="text-xs font-bold opacity-60 leading-relaxed uppercase tracking-widest px-2">
                                {errorPermiso}
                            </p>
                            <button 
                                onClick={() => setErrorPermiso(null)} 
                                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN AL SALIR */}
            {showConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" onClick={() => setShowConfirm(false)}></div>
                    <div className={`relative w-full max-w-sm p-10 rounded-[3rem] border-2 shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-100 text-slate-900"}`}>
                        <div className="text-center space-y-6">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">¿Salir sin guardar?</h3>
                            <p className="text-xs font-bold opacity-50 px-4 leading-relaxed uppercase tracking-widest">Se perderán todos los cambios realizados en esta composición.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowConfirm(false)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-400"}`}>No, seguir</button>
                                <button onClick={() => navigate("/dashboard/composiciones")} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Sí, salir</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NuevaComposicionPage;