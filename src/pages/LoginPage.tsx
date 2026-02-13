import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

export default function LoginPage() {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");

	const [password, setPassword] = useState("");

	const [errorMsg, setErrorMsg] = useState("");

	const [cargando, setCargando] = useState(false);

	const [isDark, setIsDark] = useState(() => {
		const hora = new Date().getHours();

		return hora >= 20 || hora < 10;
	});

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (token) navigate("/dashboard", { replace: true });

		const checkTime = () => {
			const hora = new Date().getHours();

			setIsDark(hora >= 20 || hora < 10);
		};

		const interval = setInterval(checkTime, 1000);

		return () => clearInterval(interval);
	}, [navigate]);

	const theme = {
		bg: isDark ? "bg-slate-950 text-white" : "bg-[#f8fafc] text-slate-900",

		glass:
			isDark ?
				"bg-white/[0.02] border-white/10 shadow-black"
			:	"bg-white/80 border-white shadow-slate-200",

		input:
			isDark ?
				"bg-slate-900/50 border-white/5 text-white focus:border-sky-500"
			:	"bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500",

		textSecondary: isDark ? "text-slate-400" : "text-slate-500",
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		setErrorMsg("");

		setCargando(true);

		try {
			const response = await fetch("http://localhost:3000/api/auth/login", {
				method: "POST",

				headers: { "Content-Type": "application/json" },

				body: JSON.stringify({ username, password }),
			});

			const result = await response.json();

			if (result.ResultCode === 0) {
				localStorage.setItem("token", result.data.accesstoken);

				localStorage.setItem("userEmail", username);

				navigate("/dashboard", { replace: true });
			} else {
				setErrorMsg(result.ResultDesc || "Credenciales incorrectas");
			}
		} catch (error) {
			setErrorMsg("No se pudo conectar con el servidor");
		} finally {
			setCargando(false);
		}
	};

	return (
		<div
			className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000 ${theme.bg}`}
		>
			<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
				<div
					className={`absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] animate-pulse transition-all duration-1000 ${isDark ? "bg-sky-500/20" : "bg-sky-500/10"}`}
				/>

				<div
					className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] animate-pulse [animation-delay:2s] transition-all duration-1000 ${isDark ? "bg-indigo-500/20" : "bg-indigo-500/10"}`}
				/>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="flex justify-center mb-12 relative">
					<div
						className={`absolute inset-0 scale-[1.6] border-2 border-dashed rounded-full animate-[spin_10s_linear_infinite] transition-colors ${isDark ? "border-sky-500/30" : "border-sky-500/20"}`}
					/>

					<div
						className={`absolute inset-0 scale-[1.3] border rounded-full animate-[spin_15s_linear_infinite_reverse] transition-colors ${isDark ? "border-indigo-500/20" : "border-indigo-500/10"}`}
					/>

					<div className="relative bg-linear-to-br from-sky-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-sky-500/40 animate-bounce-slow">
						<svg
							width="60"
							height="60"
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							strokeWidth="1.5"
						>
							<path d="M21 8V21H3V8" />
							<path d="M1 3H23V8H1V3Z" />
							<path d="M10 12H14" />

							<circle
								cx="12"
								cy="12"
								r="2"
								fill="white"
								className="animate-pulse"
							/>
						</svg>
					</div>
				</div>

				<div
					className={`backdrop-blur-2xl rounded-[3rem] p-10 border transition-all duration-700 shadow-2xl ${theme.glass}`}
				>
					<div className="text-center mb-8">
						<h1 className="text-4xl font-black tracking-tighter transition-colors">
							Sis<span className="text-sky-500">CoIn</span>
						</h1>

						<p
							className={`text-[10px] uppercase tracking-[0.5em] font-bold mt-2 ${theme.textSecondary}`}
						>
							Control de Inventarios
						</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-5">
						<div className="space-y-1">
							<input
								type="text"
								required
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${theme.input}`}
								placeholder="Usuario"
							/>
						</div>

						<div className="space-y-1">
							<input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${theme.input}`}
								placeholder="Contraseña"
							/>
						</div>

						{errorMsg && (
							<div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl text-center font-bold animate-shake">
								{errorMsg}
							</div>
						)}

						<button
							type="submit"
							disabled={cargando}
							className="w-full bg-linear-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
						>
							{cargando ? "Accediendo..." : "Iniciar Sesión"}
						</button>
					</form>
				</div>

				<div className="mt-8 text-center">
					<p
						className={`text-[9px] uppercase tracking-widest font-bold opacity-30 ${isDark ? "text-white" : "text-slate-900"}`}
					>
						Sistema Confiable de Inventariado
					</p>
				</div>
			</div>
		</div>
	);
}
