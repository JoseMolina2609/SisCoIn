import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaginaSincronizar() {
	const [nombre, setNombre] = useState("");
	const [cargando, setCargando] = useState(false);
	const [esOscuro, setEsOscuro] = useState(false);
	const navigate = useNavigate();

	const correo = sessionStorage.getItem("userEmail");

	useEffect(() => {
		// Sensor de tiempo para el tema
		const verificarHora = () => {
			const hora = new Date().getHours();
			setEsOscuro(hora >= 20 || hora < 10);
		};
		verificarHora();
	}, []);

	const manejarSincronizacion = async (e: React.FormEvent) => {
		e.preventDefault();
		setCargando(true);

		try {
			const respuesta = await fetch(
				"http://localhost:3000/api/login/sincronizar-usuario",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ correo, nombre }),
				}
			);

			const resultado = await respuesta.json();

			// Si se crea o ya existía, avanzamos al Dashboard
			if (
				resultado.ResultCode === 0 ||
				resultado.ResultDesc === "USUARIO YA REGISTRADO"
			) {
				sessionStorage.setItem("userName", nombre);
				navigate("/dashboard", { replace: true });
			} else {
				alert("Aviso: " + resultado.ResultDesc);
			}
		} catch (error) {
			alert("Error de conexión");
		} finally {
			setCargando(false);
		}
	};

	// Estilos adaptativos
	const tema = {
		fondo: esOscuro
			? "bg-slate-950 text-white"
			: "bg-[radial-gradient(circle_at_50%_50%,_rgba(240,249,255,1)_0%,_rgba(224,242,254,1)_50%,_rgba(248,250,252,1)_100%)] text-slate-900",
		tarjeta: esOscuro
			? "bg-slate-900/60 border-slate-800 shadow-2xl"
			: "bg-white/80 backdrop-blur-xl border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)]",
		input: esOscuro
			? "bg-slate-800/50 border-slate-700 text-white focus:border-sky-500 placeholder:text-slate-600"
			: "bg-slate-50 border-slate-100 text-slate-900 focus:border-sky-500 placeholder:text-slate-300",
		textoMuted: esOscuro ? "text-slate-500" : "text-slate-400",
	};

	return (
		<div
			className={`min-h-screen transition-all duration-700 font-segoe flex items-center justify-center p-6 relative overflow-hidden ${tema.fondo}`}
		>
			{/* Decoración ambiental */}
			{!esOscuro && (
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-200/30 rounded-full blur-[120px] pointer-events-none" />
			)}

			<div
				className={`relative z-10 w-full max-w-md p-10 rounded-[3rem] border transition-all duration-500 ${tema.tarjeta}`}
			>
				<div className="text-center mb-10">
					<div className="text-5xl mb-6">✨</div>
					<h2 className="text-3xl font-light tracking-tight mb-2">
						Personaliza tu perfil
					</h2>
					<p className={`text-sm ${tema.textoMuted}`}>
						Hola <span className="text-sky-500 font-medium">{correo}</span>,
						dinos tu nombre para continuar.
					</p>
				</div>

				<form onSubmit={manejarSincronizacion} className="space-y-8">
					<div className="flex flex-col gap-2">
						<label
							className={`text-[10px] uppercase tracking-[0.2em] font-bold ml-2 ${tema.textoMuted}`}
						>
							Nombre Completo
						</label>
						<input
							type="text"
							required
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							placeholder="Ej: Jose Alejandro Molina"
							className={`w-full p-4 rounded-2xl border outline-none transition-all ${tema.input}`}
						/>
					</div>

					<button
						disabled={cargando}
						className="w-full bg-sky-600 text-white py-4 rounded-3xl font-bold uppercase tracking-widest hover:bg-sky-500 hover:scale-[1.02] active:scale-95 shadow-xl shadow-sky-500/20 transition-all disabled:opacity-50"
					>
						{cargando ? "Sincronizando..." : "Finalizar Registro"}
					</button>
				</form>
			</div>
		</div>
	);
}
