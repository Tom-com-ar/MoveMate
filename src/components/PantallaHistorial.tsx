import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ActividadHistorial,
  actividadesHistorial,
} from '../data/historial';
import {
  eliminarActividadDeNube,
  obtenerActividadesDeNube,
} from '../servicios/actividadesNube';
import { supabaseConfigurado } from '../servicios/supabase';
import { TipoActividad } from './SelectorTipoActividad';
import { TarjetaActividadDeslizable } from './TarjetaActividadDeslizable';

type PropiedadesPantallaHistorial = {
  alVolver: () => void;
  usuarioId?: string;
};

type FiltroTipo = 'todas' | TipoActividad;
type FiltroFecha = '7_dias' | '30_dias' | 'todas';

const filtrosTipo: { etiqueta: string; valor: FiltroTipo }[] = [
  { etiqueta: 'Todas', valor: 'todas' },
  { etiqueta: 'Caminata', valor: 'caminata' },
  { etiqueta: 'Carrera', valor: 'carrera' },
  { etiqueta: 'Bicicleta', valor: 'bicicleta' },
];

const filtrosFecha: { etiqueta: string; valor: FiltroFecha }[] = [
  { etiqueta: '7 días', valor: '7_dias' },
  { etiqueta: '30 días', valor: '30_dias' },
  { etiqueta: 'Todo', valor: 'todas' },
];

function coincideConFecha(
  actividad: ActividadHistorial,
  filtro: FiltroFecha,
) {
  if (filtro === '7_dias') {
    return actividad.diasDesdeHoy <= 7;
  }
  if (filtro === '30_dias') {
    return actividad.diasDesdeHoy <= 30;
  }
  return true;
}

export function PantallaHistorial({
  alVolver,
  usuarioId,
}: PropiedadesPantallaHistorial) {
  const usarNube = supabaseConfigurado && Boolean(usuarioId);
  const [actividades, setActividades] = useState(() =>
    usarNube ? [] : actividadesHistorial,
  );
  const [cargando, setCargando] = useState(usarNube);
  const [mensajeError, setMensajeError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todas');
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('30_dias');

  useEffect(() => {
    if (!usarNube || !usuarioId) {
      return;
    }

    let pantallaActiva = true;

    void obtenerActividadesDeNube(usuarioId)
      .then((actividadesRecuperadas) => {
        if (pantallaActiva) {
          setActividades(actividadesRecuperadas);
        }
      })
      .catch(() => {
        if (pantallaActiva) {
          setMensajeError('No pudimos descargar tus actividades.');
        }
      })
      .finally(() => {
        if (pantallaActiva) {
          setCargando(false);
        }
      });

    return () => {
      pantallaActiva = false;
    };
  }, [usarNube, usuarioId]);

  const actividadesFiltradas = useMemo(
    () =>
      actividades.filter(
        (actividad) =>
          (filtroTipo === 'todas' || actividad.tipo === filtroTipo) &&
          coincideConFecha(actividad, filtroFecha),
      ),
    [actividades, filtroFecha, filtroTipo],
  );

  const distanciaTotal = actividadesFiltradas.reduce(
    (total, actividad) => total + actividad.distanciaKm,
    0,
  );
  const minutosTotales = actividadesFiltradas.reduce(
    (total, actividad) => total + actividad.duracionMinutos,
    0,
  );

  const eliminarActividad = (id: string) => {
    const listaAnterior = actividades;
    setActividades((listaActual) =>
      listaActual.filter((actividad) => actividad.id !== id),
    );

    if (usarNube && usuarioId) {
      void eliminarActividadDeNube(id, usuarioId).catch(() => {
        setActividades(listaAnterior);
        Alert.alert(
          'No se pudo eliminar',
          'La actividad volvió a aparecer porque no pudimos borrarla de la nube.',
        );
      });
    }
  };

  const encabezadoLista = (
    <>
      {!!mensajeError && (
        <View style={estilos.avisoError}>
          <Text style={estilos.textoAvisoError}>{mensajeError}</Text>
        </View>
      )}
      <View style={estilos.resumen}>
        <View style={estilos.datoResumen}>
          <Text style={estilos.valorResumen}>{actividadesFiltradas.length}</Text>
          <Text style={estilos.etiquetaResumen}>ACTIVIDADES</Text>
        </View>
        <View style={estilos.lineaResumen} />
        <View style={estilos.datoResumen}>
          <Text style={estilos.valorResumen}>
            {distanciaTotal.toLocaleString('es-AR', {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            })}
          </Text>
          <Text style={estilos.etiquetaResumen}>KM TOTALES</Text>
        </View>
        <View style={estilos.lineaResumen} />
        <View style={estilos.datoResumen}>
          <Text style={estilos.valorResumen}>{minutosTotales}</Text>
          <Text style={estilos.etiquetaResumen}>MINUTOS</Text>
        </View>
      </View>

      <Text style={estilos.tituloFiltro}>TIPO DE ACTIVIDAD</Text>
      <ScrollView
        contentContainerStyle={estilos.filtrosHorizontales}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filtrosTipo.map((filtro) => {
          const seleccionado = filtro.valor === filtroTipo;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: seleccionado }}
              key={filtro.valor}
              onPress={() => setFiltroTipo(filtro.valor)}
              style={[
                estilos.filtroTipo,
                seleccionado && estilos.filtroSeleccionado,
              ]}
            >
              <Text
                style={[
                  estilos.textoFiltroTipo,
                  seleccionado && estilos.textoFiltroSeleccionado,
                ]}
              >
                {filtro.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={estilos.filaFecha}>
        <Text style={estilos.tituloFiltro}>PERÍODO</Text>
        <View style={estilos.selectorFecha}>
          {filtrosFecha.map((filtro) => {
            const seleccionado = filtro.valor === filtroFecha;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: seleccionado }}
                key={filtro.valor}
                onPress={() => setFiltroFecha(filtro.valor)}
                style={[
                  estilos.filtroFecha,
                  seleccionado && estilos.filtroFechaSeleccionado,
                ]}
              >
                <Text
                  style={[
                    estilos.textoFiltroFecha,
                    seleccionado && estilos.textoFiltroFechaSeleccionado,
                  ]}
                >
                  {filtro.etiqueta}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={estilos.encabezadoResultados}>
        <Text style={estilos.tituloResultados}>Tus recorridos</Text>
        <Text style={estilos.ayudaDeslizar}>Deslizá hacia la izquierda</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={estilos.pantalla}>
      <StatusBar style="dark" />
      <View style={estilos.encabezado}>
        <Pressable
          accessibilityLabel="Volver al inicio"
          accessibilityRole="button"
          onPress={alVolver}
          style={({ pressed }) => [
            estilos.botonVolver,
            pressed && estilos.botonVolverPresionado,
          ]}
        >
          <Text style={estilos.flechaVolver}>←</Text>
        </Pressable>
        <View>
          <Text style={estilos.sobretitulo}>TU ACTIVIDAD</Text>
          <Text style={estilos.titulo}>Historial</Text>
        </View>
      </View>

      <FlatList
        ListEmptyComponent={
          cargando ? (
            <View style={estilos.vacio}>
              <ActivityIndicator color="#173F3B" />
              <Text style={estilos.textoVacio}>Sincronizando actividades...</Text>
            </View>
          ) : (
            <View style={estilos.vacio}>
              <Text style={estilos.tituloVacio}>No hay actividades</Text>
              <Text style={estilos.textoVacio}>
                Probá cambiando los filtros o registrá un nuevo recorrido.
              </Text>
            </View>
          )
        }
        ListHeaderComponent={encabezadoLista}
        contentContainerStyle={estilos.contenidoLista}
        data={actividadesFiltradas}
        keyExtractor={(actividad) => actividad.id}
        renderItem={({ item, index }) => (
          <TarjetaActividadDeslizable
            actividad={item}
            alEliminar={eliminarActividad}
            indice={index}
          />
        )}
        ItemSeparatorComponent={() => <View style={estilos.separacionTarjetas} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    backgroundColor: '#F4F6EF',
    flex: 1,
  },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  botonVolver: {
    alignItems: 'center',
    backgroundColor: '#E5EADD',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 13,
    width: 40,
  },
  botonVolverPresionado: {
    backgroundColor: '#D8DFD2',
  },
  flechaVolver: {
    color: '#173F3B',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 25,
  },
  sobretitulo: {
    color: '#6D7E77',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  titulo: {
    color: '#173F3B',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 2,
  },
  contenidoLista: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avisoError: {
    backgroundColor: '#FFE4DE',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
  },
  textoAvisoError: {
    color: '#9D4038',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  resumen: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 25,
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 19,
  },
  datoResumen: {
    alignItems: 'center',
    flex: 1,
  },
  valorResumen: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  etiquetaResumen: {
    color: '#AFC1BA',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  lineaResumen: {
    backgroundColor: '#3A5C57',
    height: 34,
    width: 1,
  },
  tituloFiltro: {
    color: '#6D7E77',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  filtrosHorizontales: {
    gap: 8,
    paddingBottom: 20,
    paddingTop: 9,
  },
  filtroTipo: {
    backgroundColor: '#E5EADD',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  filtroSeleccionado: {
    backgroundColor: '#173F3B',
  },
  textoFiltroTipo: {
    color: '#536760',
    fontSize: 11,
    fontWeight: '800',
  },
  textoFiltroSeleccionado: {
    color: '#FFFFFF',
  },
  filaFecha: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorFecha: {
    backgroundColor: '#E5EADD',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 3,
  },
  filtroFecha: {
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filtroFechaSeleccionado: {
    backgroundColor: '#FFFFFF',
  },
  textoFiltroFecha: {
    color: '#718079',
    fontSize: 9,
    fontWeight: '800',
  },
  textoFiltroFechaSeleccionado: {
    color: '#173F3B',
  },
  encabezadoResultados: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 25,
  },
  tituloResultados: {
    color: '#173F3B',
    fontSize: 18,
    fontWeight: '900',
  },
  ayudaDeslizar: {
    color: '#8A9993',
    fontSize: 9,
    fontWeight: '700',
  },
  separacionTarjetas: {
    height: 10,
  },
  vacio: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 28,
  },
  tituloVacio: {
    color: '#173F3B',
    fontSize: 16,
    fontWeight: '900',
  },
  textoVacio: {
    color: '#74827C',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
});
