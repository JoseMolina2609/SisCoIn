import { useState, useEffect } from "react";

interface GeoItem {
	id: number | string;
	nombre: string;
}

const playSound = (type: "click" | "success") => {
	const audio = new Audio(
		type === "success" ?
			"https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3"
		:	"https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
	);
	audio.volume = 0.3;
	audio.play().catch(() => {});
};

interface Proveedor {
	id: string | number;
	nombreProveedor: string;
	rfc: string;
	aliasProveedor: string;
	activo: boolean;
	nombreContacto: string;
	pais: string;
	estadoId: number | string;
	estado: string;
	municipioId: number | string;
	municipio: string;
	direccion: string;
	cp: string;
	telefono: string;
	email: string;
}

export default function ProveedoresPage({ isDark }: { isDark: boolean }) {
	const [view, setView] = useState<"list" | "form">(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("sesion_proveedor");
			return saved ? JSON.parse(saved).view : "list";
		}
		return "list";
	});

	const [formData, setFormData] = useState<Proveedor>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("sesion_proveedor");
			if (saved) return JSON.parse(saved).formData;
		}
		return {
			id: 0,
			nombreProveedor: "",
			rfc: "",
			aliasProveedor: "",
			activo: true,
			nombreContacto: "",
			pais: "MEXICO",
			estadoId: "",
			estado: "",
			municipioId: "",
			municipio: "",
			direccion: "",
			cp: "",
			telefono: "",
			email: "",
		};
	});

	const [lista, setLista] = useState<Proveedor[]>([]);
	const [busqueda, setBusqueda] = useState("");
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">(
		"idle",
	);
	const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

	const [estados, setEstados] = useState<GeoItem[]>([]);
	const [municipios, setMunicipios] = useState<GeoItem[]>([]);

	useEffect(() => {
		localStorage.setItem(
			"sesion_proveedor",
			JSON.stringify({ view, formData }),
		);
	}, [view, formData]);

	useEffect(() => {
		if (view === "list") fetchLista();
		if (view === "form") fetchEstados();
	}, [view]);

	useEffect(() => {
		if (formData.estadoId) {
			fetchMunicipios(formData.estadoId);
		} else {
			setMunicipios([]);
		}
	}, [formData.estadoId]);

	const fetchLista = async () => {
		try {
			const response = await fetch(
				"http://localhost:3000/api/catalogos/proveedores/lista",
			);
			const json = await response.json();
			if (json.data) {
				setLista(
					json.data.sort(
						(a: Proveedor, b: Proveedor) => Number(a.id) - Number(b.id),
					),
				);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const fetchEstados = async () => {
		try {
			const response = await fetch(
				"http://localhost:3000/api/geografia/estados",
			);
			const json = await response.json();
			if (json.ResultCode === 0) setEstados(json.data);
		} catch (error) {
			console.error("Error cargando estados:", error);
		}
	};

	const fetchMunicipios = async (estadoId: string | number) => {
		try {
			const response = await fetch(
				`http://localhost:3000/api/geografia/municipios?estadoId=${estadoId}`,
			);
			const json = await response.json();
			if (json.ResultCode === 0) setMunicipios(json.data);
		} catch (error) {
			console.error("Error cargando municipios:", error);
		}
	};

	const handleDoubleClick = async (id: string | number) => {
		try {
			const response = await fetch(
				`http://localhost:3000/api/catalogos/proveedores/lista?id=${id}`,
			);
			const json = await response.json();
			if (json.data?.[0]) {
				setFormData(json.data[0]);
				setView("form");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		if (name === "estadoId") {
			const est = estados.find((x) => String(x.id) === String(value));
			setFormData((prev) => ({
				...prev,
				estadoId: value,
				estado: est ? est.nombre : "",
				municipioId: "",
				municipio: "",
			}));
		} else if (name === "municipioId") {
			const mun = municipios.find((x) => String(x.id) === String(value));
			setFormData((prev) => ({
				...prev,
				municipioId: value,
				municipio: mun ? mun.nombre : "",
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saveStatus === "saving") return;

		const payload = {
			id: formData.id,
			nombreProveedor: formData.nombreProveedor,
			rfc: formData.rfc,
			aliasProveedor: formData.aliasProveedor,
			activo: formData.activo,
			nombreContacto: formData.nombreContacto,
			pais: formData.pais,
			estadoId: Number(formData.estadoId),
			municipioId: Number(formData.municipioId),
			direccion: formData.direccion,
			cp: formData.cp,
			telefono: formData.telefono,
			email: formData.email,
		};

		playSound("click");
		setSaveStatus("saving");

		try {
			const response = await fetch(
				"http://localhost:3000/api/catalogos/proveedores/guardar",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				},
			);
			const res = await response.json();

			if (res.ResultCode === 0) {
				playSound("success");
				localStorage.removeItem("sesion_proveedor");
				setView("list");
				setSaveStatus("idle");
				setMensaje({ texto: res.ResultDesc, tipo: "success" });
				setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
			} else {
				setSaveStatus("error");
				setMensaje({ texto: res.ResultDesc, tipo: "error" });
				setTimeout(() => setSaveStatus("idle"), 3000);
			}
		} catch (error) {
			setSaveStatus("error");
			setMensaje({ texto: "Error de comunicación", tipo: "error" });
			setTimeout(() => setSaveStatus("idle"), 3000);
		}
	};

	const styles = {
		card: `p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[180px] ${isDark ? "bg-slate-900/40 border-slate-800 hover:border-sky-500/30 shadow-2xl shadow-black/20" : "bg-white border-slate-200 shadow-sm hover:shadow-xl"}`,
		sectionCard: `p-8 rounded-[2.5rem] border transition-all duration-500 ${isDark ? "bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.05)]"}`,
		inputGroup: `flex flex-col gap-2`,
		inputLabel: `text-[9px] font-black uppercase tracking-widest ml-4 ${isDark ? "text-slate-500" : "text-slate-400"}`,
		input: `w-full p-4 rounded-2xl border transition-all duration-300 outline-none focus:ring-4 ${isDark ? "bg-slate-950/50 border-slate-800 text-white focus:ring-sky-500/20 shadow-inner" : "bg-white border-slate-200 text-slate-900 focus:ring-sky-500/10 shadow-sm"}`,
		sectionTitle: `flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${isDark ? "text-sky-500/80" : "text-sky-600/80"}`,
		iconCircle: `w-8 h-8 rounded-lg flex items-center justify-center mb-4 text-lg ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-sky-100 text-sky-600"}`,
		backBtn: `group flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white"}`,
	};

	return (
		<div className="relative h-full w-full overflow-hidden">
			{saveStatus === "saving" && (
				<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm bg-slate-950/20 animate-in fade-in duration-200">
					<div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			)}

			{mensaje.texto && (
				<div
					className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] border backdrop-blur-md animate-in slide-in-from-top-10 duration-500 ${mensaje.tipo === "success" ? "bg-green-500 text-white border-green-400" : "bg-red-500 text-white border-red-400"}`}
				>
					{mensaje.texto}
				</div>
			)}

			{view === "list" ?
				<div className="h-full flex flex-col p-4 animate-in fade-in duration-700">
					<header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
						<div>
							<h1
								className={`text-5xl font-[900] tracking-[-0.05em] leading-none whitespace-nowrap ${isDark ? "text-white" : "text-slate-900"}`}
							>
								CATÁLOGO DE&nbsp;
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600">
									PROVEEDORES
								</span>
							</h1>
							<div className="flex items-center gap-3 mt-4">
								<p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em]">
									Gestión de catalogo de proveedores
								</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
							<div className="relative w-full md:w-64 group">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
									🔍
								</span>
								<input
									type="text"
									placeholder="Buscar socio..."
									value={busqueda}
									onChange={(e) => setBusqueda(e.target.value)}
									className={`${styles.input} pl-12`}
								/>
							</div>
							<button
								onClick={() => {
									setFormData({
										id: 0,
										nombreProveedor: "",
										rfc: "",
										aliasProveedor: "",
										activo: true,
										nombreContacto: "",
										pais: "MEXICO",
										estadoId: "",
										estado: "",
										municipioId: "",
										municipio: "",
										direccion: "",
										cp: "",
										telefono: "",
										email: "",
									});
									setView("form");
								}}
								className="px-10 py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-sky-500/20 active:scale-95 flex items-center gap-2"
							>
								<span>+</span> Registrar Nuevo
							</button>
						</div>
					</header>

					<div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-20">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{lista
								.filter((p) =>
									p.nombreProveedor
										.toLowerCase()
										.includes(busqueda.toLowerCase()),
								)
								.map((p) => (
									<div
										key={p.id}
										onDoubleClick={() => handleDoubleClick(p.id)}
										className={styles.card}
									>
										<div
											className={`absolute top-0 right-0 w-1.5 h-full ${p.activo ? "bg-green-500" : "bg-red-500"}`}
										/>
										<div className="flex justify-between items-start">
											<div
												className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${isDark ? "bg-slate-800 text-sky-400" : "bg-sky-50 text-sky-600"}`}
											>
												{p.nombreProveedor.charAt(0)}
											</div>
											<span className="text-[10px] font-mono opacity-30">
												Id: #{p.id}
											</span>
										</div>
										<div className="mt-4">
											<h3
												className={`font-bold text-sm leading-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}
											>
												{p.nombreProveedor}
											</h3>
											<p className="text-[10px] font-mono opacity-40 mt-1 uppercase">
												{p.rfc || "Sin RFC"}
											</p>
										</div>
										<div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-500/10">
											<span className="text-[9px] font-black opacity-40 uppercase truncate">
												{p.municipio || "N/A"}
											</span>
											<span className="text-sky-500 font-black text-[9px]">
												DETALLES →
											</span>
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			:	<div className="h-full flex flex-col p-4 animate-in slide-in-from-right-10 duration-500">
					<header className="flex justify-between items-center mb-8">
						<button
							onClick={() => {
								localStorage.removeItem("sesion_proveedor");
								setView("list");
							}}
							className={styles.backBtn}
						>
							← Cancelar
						</button>
						<div className="text-right">
							<h2
								className={`text-2xl font-black tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}
							>
								{formData.id === 0 ? "Nuevo Proveedor" : "Editar Proveedor"}
							</h2>
							<p className="text-[9px] font-bold text-sky-500 tracking-[0.3em] uppercase">
								ID: {formData.id || "AUTO"}
							</p>
						</div>
					</header>

					<form
						onSubmit={handleSubmit}
						className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-12 pb-32"
					>
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							<div className="lg:col-span-7 space-y-8">
								<section className={styles.sectionCard}>
									<div className={styles.iconCircle}>🏢</div>
									<span className={styles.sectionTitle}>
										Identificación Fiscal
									</span>
									<div className="grid grid-cols-1 gap-6">
										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>
												Razón Social / Nombre
											</label>
											<input
												name="nombreProveedor"
												value={formData.nombreProveedor}
												onChange={handleChange}
												className={styles.input}
												required
											/>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
											<div className={styles.inputGroup}>
												<label className={styles.inputLabel}>RFC</label>
												<input
													name="rfc"
													value={formData.rfc}
													onChange={handleChange}
													className={styles.input}
												/>
											</div>
											<div className={styles.inputGroup}>
												<label className={styles.inputLabel}>
													Alias Comercial
												</label>
												<input
													name="aliasProveedor"
													value={formData.aliasProveedor}
													onChange={handleChange}
													className={styles.input}
												/>
											</div>
										</div>
									</div>
								</section>

								<section className={styles.sectionCard}>
									<div className={styles.iconCircle}>📍</div>
									<span className={styles.sectionTitle}>
										Ubicación y Domicilio
									</span>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>País</label>
											<select
												name="pais"
												value={formData.pais}
												onChange={handleChange}
												className={styles.input}
											>
												<option value="MEXICO">MEXICO</option>
												<option value="USA">USA</option>
											</select>
										</div>

										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>Estado</label>
											<select
												name="estadoId"
												value={formData.estadoId}
												onChange={handleChange}
												className={styles.input}
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

										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>Municipio</label>
											<select
												name="municipioId"
												value={formData.municipioId}
												onChange={handleChange}
												className={styles.input}
												disabled={!formData.estadoId}
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

										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>CP</label>
											<input
												name="cp"
												value={formData.cp}
												onChange={handleChange}
												className={styles.input}
												maxLength={5}
											/>
										</div>
										<div className={`${styles.inputGroup} sm:col-span-2`}>
											<label className={styles.inputLabel}>Dirección</label>
											<input
												name="direccion"
												value={formData.direccion}
												onChange={handleChange}
												className={styles.input}
											/>
										</div>
									</div>
								</section>
							</div>

							<div className="lg:col-span-5 space-y-8">
								<section className={styles.sectionCard}>
									<div className={styles.iconCircle}>👤</div>
									<span className={styles.sectionTitle}>Contacto</span>
									<div className="space-y-6">
										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>
												Nombre Contacto
											</label>
											<input
												name="nombreContacto"
												value={formData.nombreContacto}
												onChange={handleChange}
												className={styles.input}
											/>
										</div>
										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>Email</label>
											<input
												name="email"
												value={formData.email}
												onChange={handleChange}
												className={styles.input}
											/>
										</div>
										<div className={styles.inputGroup}>
											<label className={styles.inputLabel}>Teléfono</label>
											<input
												name="telefono"
												value={formData.telefono}
												onChange={handleChange}
												className={styles.input}
											/>
										</div>
									</div>
								</section>

								<div
									className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${formData.activo ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}
								>
									<div className="flex items-center justify-between">
										<span
											className={`text-[10px] font-black uppercase tracking-widest ${formData.activo ? "text-green-500" : "text-red-500"}`}
										>
											Estatus: {formData.activo ? "Activo" : "Inactivo"}
										</span>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												name="activo"
												checked={formData.activo}
												onChange={handleChange}
												className="sr-only peer"
											/>
											<div className="w-14 h-8 bg-slate-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full" />
										</label>
									</div>
								</div>
							</div>
						</div>

						<div className="fixed bottom-10 right-10">
							<button
								type="submit"
								disabled={saveStatus === "saving"}
								className="px-14 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl bg-sky-600 text-white hover:scale-105 active:scale-95 shadow-sky-500/40 disabled:opacity-50 transition-all"
							>
								{saveStatus === "saving" ?
									"Guardando..."
								:	"Confirmar y Guardar"}
							</button>
						</div>
					</form>
				</div>
			}
		</div>
	);
}
