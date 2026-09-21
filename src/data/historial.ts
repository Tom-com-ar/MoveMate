import type { TipoActividad } from '../components/SelectorTipoActividad';

export type ActividadHistorial = {
  calorias: number;
  diasDesdeHoy: number;
  distanciaKm: number;
  duracionMinutos: number;
  fecha: string;
  hora: string;
  id: string;
  tipo: TipoActividad;
};

export const actividadesHistorial: ActividadHistorial[] = [
  {
    calorias: 238,
    diasDesdeHoy: 1,
    distanciaKm: 4.2,
    duracionMinutos: 48,
    fecha: '20 SEP',
    hora: '18:20',
    id: 'actividad-1',
    tipo: 'caminata',
  },
  {
    calorias: 412,
    diasDesdeHoy: 3,
    distanciaKm: 5.8,
    duracionMinutos: 34,
    fecha: '18 SEP',
    hora: '07:35',
    id: 'actividad-2',
    tipo: 'carrera',
  },
  {
    calorias: 506,
    diasDesdeHoy: 6,
    distanciaKm: 14.6,
    duracionMinutos: 58,
    fecha: '15 SEP',
    hora: '16:10',
    id: 'actividad-3',
    tipo: 'bicicleta',
  },
  {
    calorias: 221,
    diasDesdeHoy: 11,
    distanciaKm: 4.1,
    duracionMinutos: 52,
    fecha: '10 SEP',
    hora: '19:05',
    id: 'actividad-4',
    tipo: 'caminata',
  },
  {
    calorias: 558,
    diasDesdeHoy: 19,
    distanciaKm: 7.3,
    duracionMinutos: 45,
    fecha: '2 SEP',
    hora: '08:15',
    id: 'actividad-5',
    tipo: 'carrera',
  },
  {
    calorias: 694,
    diasDesdeHoy: 28,
    distanciaKm: 21.8,
    duracionMinutos: 78,
    fecha: '24 AGO',
    hora: '10:30',
    id: 'actividad-6',
    tipo: 'bicicleta',
  },
  {
    calorias: 184,
    diasDesdeHoy: 37,
    distanciaKm: 3.5,
    duracionMinutos: 43,
    fecha: '15 AGO',
    hora: '17:45',
    id: 'actividad-7',
    tipo: 'caminata',
  },
];
