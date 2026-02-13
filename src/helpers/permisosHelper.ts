export const checkPermiso = (
	moduloId: number,
	accion: "Visualizar" | "Insertar" | "Actualizar" | "Eliminar",
): boolean => {
	const permisosRaw = localStorage.getItem("permisos");
	if (!permisosRaw) return false;

	try {
		const permisos = JSON.parse(permisosRaw);

		const modulo = permisos.find((p: any) => p.IdModulo === moduloId);

		return modulo ? !!modulo[accion] : false;
	} catch (e) {
		return false;
	}
};
