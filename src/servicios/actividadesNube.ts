import type { ActividadHistorial } from '../data/historial';
import type { ActividadCompletada, PuntoRuta } from '../types/actividad';
import {
  crearResumenInicioVacio,
  type ResumenInicio,
} from '../types/resumenInicio';
import type { TipoActividad } from '../components/SelectorTipoActividad';
import { supabase } from './supabase';

type FilaActividad = {
  calorias: number;
  distancia_metros: number;
  duracion_segundos: number;
  finalizada_en: string;
  id: string;
  iniciada_en: string;
  ruta: PuntoRuta[];
  tipo: TipoActividad;
  usuario_id: string;
};

type FilaResumen = Pick<
  FilaActividad,
  'calorias' | 'distancia_metros' | 'duracion_segundos' | 'iniciada_en'
>;

const nombresMeses = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
] as const;

function convertirFilaParaHistorial(fila: FilaActividad): ActividadHistorial {
  const fechaInicio = new Date(fila.iniciada_en);
  const diferenciaMilisegundos = Date.now() - fechaInicio.getTime();

  return {
    calorias: fila.calorias,
    diasDesdeHoy: Math.max(
      0,
      Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24)),
    ),
    distanciaKm: fila.distancia_metros / 1000,
    duracionMinutos: Math.max(1, Math.round(fila.duracion_segundos / 60)),
    fecha: `${fechaInicio.getDate()} ${nombresMeses[fechaInicio.getMonth()]}`,
    hora: fechaInicio.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    id: fila.id,
    tipo: fila.tipo,
  };
}

function exigirClienteSupabase() {
  if (!supabase) {
    throw new Error('Supabase todavía no está configurado.');
  }
  return supabase;
}

function obtenerClaveFecha(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function calcularRacha(filas: FilaResumen[]) {
  const diasConActividad = new Set(
    filas.map((fila) => obtenerClaveFecha(new Date(fila.iniciada_en))),
  );
  const cursor = new Date();

  if (!diasConActividad.has(obtenerClaveFecha(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let racha = 0;
  while (diasConActividad.has(obtenerClaveFecha(cursor))) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return racha;
}

export async function guardarActividadEnNube(
  actividad: ActividadCompletada,
  usuarioId: string,
) {
  const cliente = exigirClienteSupabase();
  const { error } = await cliente.from('actividades').insert({
    calorias: actividad.calorias,
    distancia_metros: actividad.distanciaMetros,
    duracion_segundos: actividad.duracionSegundos,
    finalizada_en: actividad.finalizadaEn,
    iniciada_en: actividad.iniciadaEn,
    ruta: actividad.ruta,
    tipo: actividad.tipo,
    usuario_id: usuarioId,
  });

  if (error) {
    throw error;
  }
}

export async function obtenerActividadesDeNube(usuarioId: string) {
  const cliente = exigirClienteSupabase();
  const { data, error } = await cliente
    .from('actividades')
    .select(
      'id, usuario_id, tipo, iniciada_en, finalizada_en, duracion_segundos, distancia_metros, calorias, ruta',
    )
    .eq('usuario_id', usuarioId)
    .order('iniciada_en', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as FilaActividad[]).map(convertirFilaParaHistorial);
}

export async function obtenerResumenDeInicio(
  usuarioId: string,
): Promise<ResumenInicio> {
  const cliente = exigirClienteSupabase();
  const { data, error } = await cliente
    .from('actividades')
    .select('iniciada_en, duracion_segundos, distancia_metros, calorias')
    .eq('usuario_id', usuarioId)
    .order('iniciada_en', { ascending: false });

  if (error) {
    throw error;
  }

  const filas = data as FilaResumen[];
  const hoy = obtenerClaveFecha(new Date());
  const actividadesDeHoy = filas.filter(
    (fila) => obtenerClaveFecha(new Date(fila.iniciada_en)) === hoy,
  );
  const resumen = crearResumenInicioVacio();

  return {
    ...resumen,
    calorias: actividadesDeHoy.reduce(
      (total, fila) => total + fila.calorias,
      0,
    ),
    distanciaKm:
      actividadesDeHoy.reduce(
        (total, fila) => total + fila.distancia_metros,
        0,
      ) / 1000,
    minutosActivos: actividadesDeHoy.reduce(
      (total, fila) =>
        total + Math.max(1, Math.round(fila.duracion_segundos / 60)),
      0,
    ),
    rachaDias: calcularRacha(filas),
  };
}

export async function eliminarActividadDeNube(
  actividadId: string,
  usuarioId: string,
) {
  const cliente = exigirClienteSupabase();
  const { error } = await cliente
    .from('actividades')
    .delete()
    .eq('id', actividadId)
    .eq('usuario_id', usuarioId);

  if (error) {
    throw error;
  }
}
