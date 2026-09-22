import type { TipoActividad } from '../components/SelectorTipoActividad';

export type PuntoRuta = {
  latitude: number;
  longitude: number;
};

export type ActividadCompletada = {
  calorias: number;
  distanciaMetros: number;
  duracionSegundos: number;
  finalizadaEn: string;
  iniciadaEn: string;
  ruta: PuntoRuta[];
  tipo: TipoActividad;
};
