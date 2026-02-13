import { useState, useEffect } from "react";

interface GeoItem {
	id: number | string;
	nombre: string;
}

interface Sucursal {
	id: number | string;
	nombre: string;
	direccion: string;
	cp: string;
	telefono: string;
	email: string;
	activa: boolean;
	estadoId: number | string;
	municipioId: number | string;
	nombreEstado?: string;
	nombreMunicipio?: string;
}

export default function SucursalesPage({ isDark }: { isDark: boolean }) {
	const [lista, setLista] = useState<Sucursal[]>([]);
	const [selected, setSelected] = useState<Sucursal | null>(null);
	const [view, setView] = useState<"view" | "edit" | "new">("view");

	const [formData, setFormData] = useState<Sucursal | null>(null);
	const [estados, setEstados] = useState<GeoItem[]>([]);
	const [municipios, setMunicipios] = useState<GeoItem[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		fetchLista();
		fetchEstados();
	}, []);

	useEffect(() => {
		if (formData?.estadoId) fetchMunicipios(formData.estadoId);
		else setMunicipios([]);
	}, [formData?.estadoId]);

	const fetchLista = async () => {
		try {
			const res = await fetch(
				"http://localhost:3000/api/catalogos/sucursales/lista",
			);
			const json = await res.json();
			if (json.data) {
				setLista(json.data);
				if (!selected && json.data.length > 0) setSelected(json.data[0]);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const fetchEstados = async () => {
		try {
			const res = await fetch("http://localhost:3000/api/geografia/estados");
			const json = await res.json();
			if (json.ResultCode === 0) setEstados(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchMunicipios = async (id: string | number) => {
		try {
			const res = await fetch(
				`http://localhost:3000/api/geografia/municipios?estadoId=${id}`,
			);
			const json = await res.json();
			if (json.ResultCode === 0) setMunicipios(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const handleAction = (type: "new" | "edit") => {
		if (type === "new") {
			setFormData({
				id: 0,
				nombre: "",
				direccion: "",
				cp: "",
				telefono: "",
				email: "",
				activa: true,
				estadoId: "",
				municipioId: "",
			});
			setView("new");
		} else {
			setFormData(selected);
			setView("edit");
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		setFormData((prev) =>
			prev ?
				{
					...prev,
					[name]: type === "checkbox" ? checked : value,
					...(name === "estadoId" ? { municipioId: "" } : {}),
				}
			:	null,
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData) return;
		setIsSaving(true);

		const payload = {
			...formData,
			id: Number(formData.id),
			estadoId: Number(formData.estadoId),
			municipioId: Number(formData.municipioId),
		};

		try {
			const res = await fetch(
				"http://localhost:3000/api/catalogos/sucursales/guardar",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const data = await res.json();
			if (data.ResultCode === 0) {
				await fetchLista();
				// Si es edición, actualizamos el 'selected' para que la vista detalle se refresque
				if (formData.id !== 0) {
					const updatedSucursal = { ...formData };
					// Buscamos los nombres de estado/municipio para la vista detalle
					updatedSucursal.nombreEstado = estados.find(
						(es) => es.id == formData.estadoId,
					)?.nombre;
					updatedSucursal.nombreMunicipio = municipios.find(
						(mu) => mu.id == formData.municipioId,
					)?.nombre;
					setSelected(updatedSucursal);
				}
				setView("view");
			}
		} catch (e) {
			console.error(e);
		}
		setIsSaving(false);
	};

	const theme = {
		accent: "from-violet-600 to-cyan-500",
		bgPanel: isDark ? "bg-slate-900/90" : "bg-white",
		textMain: isDark ? "text-white" : "text-slate-900",
		border: isDark ? "border-slate-800" : "border-slate-200",
		input: `w-full p-3 rounded-xl border transition-all outline-none ${isDark ? "bg-slate-800 border-slate-700 text-white focus:border-violet-500" : "bg-slate-50 border-slate-200 focus:border-violet-500"}`,
	};

	return (
		<div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 p-2">
			{/* Header Superior */}
			<div className="flex justify-between items-center">
				<div>
					<h2
						className={`text-4xl font-black italic tracking-tighter ${theme.textMain}`}
					>
						CATALOGO{" "}
						<span className="inline-block pr-3 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400">
							DE SUCURSALES
						</span>
					</h2>
					<p className="text-[10px] font-bold tracking-[0.3em] opacity-40 uppercase">
						Explora el catálogo de tus sucursales
					</p>
				</div>
				<button
					onClick={() => handleAction("new")}
					className={`px-8 py-3 rounded-full bg-gradient-to-r ${theme.accent} text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/20`}
				>
					+ Registrar sucursal
				</button>
			</div>

			<div className="flex-1 flex gap-6 overflow-hidden">
				{/* Panel Izquierdo: Listado */}
				<div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
					{lista
						.slice()
						.sort((a, b) => Number(a.id) - Number(b.id))
						.map((s) => (
							<div
								key={s.id}
								onClick={() => {
									setSelected(s);
									setView("view");
								}}
								className={`group cursor-pointer p-5 rounded-[1.8rem] border-2 transition-all duration-300 ${
									selected?.id === s.id && view === "view" ?
										`border-violet-500 shadow-xl ${isDark ? "bg-violet-500/10" : "bg-violet-50"}`
									:	`${theme.border} ${theme.bgPanel} hover:border-slate-400`
								}`}
							>
								<div className="flex justify-between items-center">
									<span
										className={`text-[9px] font-black px-2 py-1 rounded-md ${s.activa ? "bg-cyan-500/20 text-cyan-500" : "bg-red-500/20 text-red-500"}`}
									>
										{s.activa ? "ACTIVA" : "INACTIVA"}
									</span>
									<span className="opacity-30 font-mono text-[10px]">
										#ID-{s.id}
									</span>
								</div>
								<h3 className={`mt-2 font-bold truncate ${theme.textMain}`}>
									{s.nombre}
								</h3>
								<p className="text-[11px] opacity-50 italic">
									{s.nombreMunicipio}, {s.nombreEstado}
								</p>
							</div>
						))}
				</div>

				{/* Panel Derecho: Detalle o Formulario */}
				<div
					className={`flex-1 rounded-[3rem] border-2 ${theme.border} ${theme.bgPanel} overflow-hidden flex flex-col relative`}
				>
					<div
						className={`h-24 w-full bg-gradient-to-r ${theme.accent} relative`}
					>
						<div className="absolute -bottom-8 left-10">
							<div
								className={`w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center text-3xl border-4 ${isDark ? "bg-slate-800 border-slate-900" : "bg-white border-slate-50"}`}
							>
								{view === "view" ? "🏢" : "⚙️"}
							</div>
						</div>
					</div>

					<div className="mt-12 px-10 pb-10 flex-1 overflow-y-auto custom-scrollbar">
						{view === "view" && selected ?
							<div className="animate-in fade-in slide-in-from-right-4 duration-400">
								<div className="flex justify-between items-start mb-8">
									<div>
										<h3
											className={`text-4xl font-black tracking-tight ${theme.textMain}`}
										>
											{selected.nombre}
										</h3>
										<p className="text-violet-500 font-mono text-xs font-bold mt-1 uppercase">
											Sucursal Operativa Verificada
										</p>
									</div>
									<button
										onClick={() => handleAction("edit")}
										className="px-6 py-2 rounded-xl border-2 border-violet-500/30 text-violet-500 font-black text-[10px] uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all shadow-sm"
									>
										✏️ Editar Sucursal
									</button>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div
										className={`p-6 rounded-3xl border ${theme.border} ${isDark ? "bg-slate-800/30" : "bg-slate-50"}`}
									>
										<p className="text-[10px] font-black text-violet-500 uppercase mb-4 tracking-tighter">
											📍 Ubicación Geográfica
										</p>
										<p className="text-sm font-bold mb-1 uppercase">
											{selected.direccion}
										</p>
										<p className="text-xs opacity-60 font-medium">
											{selected.nombreMunicipio}, {selected.nombreEstado} • C.P.{" "}
											{selected.cp}
										</p>
									</div>
									<div
										className={`p-6 rounded-3xl border ${theme.border} ${isDark ? "bg-slate-800/30" : "bg-slate-50"}`}
									>
										<p className="text-[10px] font-black text-cyan-500 uppercase mb-4 tracking-tighter">
											📞 Canales de Contacto
										</p>
										<p className="text-sm font-bold mb-1">
											{selected.telefono || "Sin Teléfono"}
										</p>
										<p className="text-xs opacity-60 truncate font-medium">
											{selected.email || "Sin Email Registrado"}
										</p>
									</div>
								</div>
							</div>
						:	<form
								onSubmit={handleSubmit}
								className="animate-in slide-in-from-bottom-4 duration-300 space-y-6"
							>
								<h3
									className={`text-2xl font-black uppercase tracking-tighter ${theme.textMain}`}
								>
									{view === "new" ?
										"Registrar nueva Sucursal"
									:	"Modificar datos de Sucursal"}
								</h3>

								<div className="grid grid-cols-2 gap-4">
									<div className="col-span-2">
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Nombre de la Sucursal
										</label>
										<input
											name="nombre"
											value={formData?.nombre || ""}
											onChange={handleChange}
											className={theme.input}
											placeholder="Ej. Sucursal Centro"
											required
										/>
									</div>
									<div>
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Estado
										</label>
										<select
											name="estadoId"
											value={formData?.estadoId || ""}
											onChange={handleChange}
											className={theme.input}
											required
										>
											<option value="">Seleccionar...</option>
											{estados.map((e) => (
												<option key={e.id} value={e.id}>
													{e.nombre}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Municipio
										</label>
										<select
											name="municipioId"
											value={formData?.municipioId || ""}
											onChange={handleChange}
											className={theme.input}
											disabled={!formData?.estadoId}
											required
										>
											<option value="">Seleccionar...</option>
											{municipios.map((m) => (
												<option key={m.id} value={m.id}>
													{m.nombre}
												</option>
											))}
										</select>
									</div>
									<div className="col-span-2">
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Dirección Completa
										</label>
										<input
											name="direccion"
											value={formData?.direccion || ""}
											onChange={handleChange}
											className={theme.input}
											required
										/>
									</div>
									<div>
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Código Postal
										</label>
										<input
											name="cp"
											value={formData?.cp || ""}
											onChange={handleChange}
											className={theme.input}
											maxLength={5}
										/>
									</div>
									<div>
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Teléfono de Enlace
										</label>
										<input
											name="telefono"
											value={formData?.telefono || ""}
											onChange={handleChange}
											className={theme.input}
										/>
									</div>
									<div className="col-span-2">
										<label className="text-[10px] font-black uppercase opacity-50 ml-2">
											Email Corporativo
										</label>
										<input
											name="email"
											type="email"
											value={formData?.email || ""}
											onChange={handleChange}
											className={theme.input}
										/>
									</div>
								</div>

								{/* Switch de Activo */}
								<div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-500/10 bg-slate-500/5">
									<div className="flex flex-col">
										<span className="text-[10px] font-black uppercase opacity-70 tracking-widest">
											Estado Operativo
										</span>
										<span
											className={`text-[9px] font-bold ${formData?.activa ? "text-cyan-500" : "text-red-500"}`}
										>
											{formData?.activa ?
												"SUCURSAL ACTIVA"
											:	"SUCURSAL INACTIVA"}
										</span>
									</div>
									<label className="relative inline-flex items-center cursor-pointer ml-auto">
										<input
											type="checkbox"
											name="activa"
											checked={formData?.activa || false}
											onChange={handleChange}
											className="sr-only peer"
										/>
										<div className="w-14 h-7 rounded-full transition-all duration-300 bg-slate-300 dark:bg-slate-700 peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-cyan-400 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-inner"></div>
									</label>
								</div>

								<div className="flex justify-between items-center pt-4">
									<button
										type="button"
										onClick={() => setView("view")}
										className="px-6 py-3 rounded-xl font-bold text-xs opacity-50 hover:opacity-100 transition-all text-red-500"
									>
										Cancelar
									</button>
									<button
										type="submit"
										disabled={isSaving}
										className={`px-12 py-3 rounded-xl bg-gradient-to-r ${theme.accent} text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-violet-500/30 hover:scale-105 transition-all`}
									>
										{isSaving ? "Guardando..." : "Guardar"}
									</button>
								</div>
							</form>
						}
					</div>
				</div>
			</div>
		</div>
	);
}
