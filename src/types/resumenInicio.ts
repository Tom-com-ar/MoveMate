export type ResumenInicio = {
  calorias: number;
  distanciaKm: number;
  fechaEtiqueta: string;
  metaMinutos: number;
  minutosActivos: number;
  rachaDias: number;
};

export function crearResumenInicioVacio(): ResumenInicio {
  const fecha = new Date();
  const dia = fecha.getDate();
  const mes = fecha
    .toLocaleDateString('es-AR', { month: 'short' })
    .replace('.', '')
    .toUpperCase();

  return {
    calorias: 0,
    distanciaKm: 0,
    fechaEtiqueta: `HOY · ${dia} ${mes}`,
    metaMinutos: 30,
    minutosActivos: 0,
    rachaDias: 0,
  };
}
