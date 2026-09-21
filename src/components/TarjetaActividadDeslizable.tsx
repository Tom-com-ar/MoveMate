import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { ActividadHistorial } from '../data/historial';
import { nombresActividad } from './SelectorTipoActividad';

type PropiedadesTarjetaActividadDeslizable = {
  actividad: ActividadHistorial;
  alEliminar: (id: string) => void;
  indice: number;
};

const aparienciaPorTipo = {
  bicicleta: { color: '#D9D8FF', icono: 'BICI' },
  caminata: { color: '#CFEBDD', icono: 'CAM' },
  carrera: { color: '#FFD6BA', icono: 'COR' },
} as const;

export function TarjetaActividadDeslizable({
  actividad,
  alEliminar,
  indice,
}: PropiedadesTarjetaActividadDeslizable) {
  const apariencia = aparienciaPorTipo[actividad.tipo];

  const mostrarAccionEliminar = (
    _progreso: unknown,
    _traslacion: unknown,
    metodos: SwipeableMethods,
  ) => (
    <Pressable
      accessibilityLabel={`Eliminar ${nombresActividad[actividad.tipo]}`}
      accessibilityRole="button"
      onPress={() => {
        metodos.close();
        alEliminar(actividad.id);
      }}
      style={estilos.accionEliminar}
    >
      <Text style={estilos.iconoEliminar}>×</Text>
      <Text style={estilos.textoEliminar}>Eliminar</Text>
    </Pressable>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(indice * 55, 220)).duration(280)}
    >
      <ReanimatedSwipeable
        containerStyle={estilos.contenedorDeslizable}
        friction={2}
        overshootRight={false}
        renderRightActions={mostrarAccionEliminar}
        rightThreshold={44}
      >
        <View
          accessible
          accessibilityLabel={`${nombresActividad[actividad.tipo]}, ${actividad.distanciaKm.toFixed(1)} kilómetros, ${actividad.duracionMinutos} minutos`}
          style={estilos.tarjeta}
        >
          <View
            style={[estilos.iconoActividad, { backgroundColor: apariencia.color }]}
          >
            <Text style={estilos.textoIconoActividad}>{apariencia.icono}</Text>
          </View>

          <View style={estilos.contenido}>
            <View style={estilos.filaSuperior}>
              <View>
                <Text style={estilos.tipoActividad}>
                  {nombresActividad[actividad.tipo]}
                </Text>
                <Text style={estilos.fecha}>
                  {actividad.fecha} · {actividad.hora}
                </Text>
              </View>
              <View style={estilos.distancia}>
                <Text style={estilos.valorDistancia}>
                  {actividad.distanciaKm.toLocaleString('es-AR', {
                    maximumFractionDigits: 1,
                    minimumFractionDigits: 1,
                  })}
                </Text>
                <Text style={estilos.unidadDistancia}>km</Text>
              </View>
            </View>

            <View style={estilos.filaDatos}>
              <Text style={estilos.dato}>{actividad.duracionMinutos} min</Text>
              <View style={estilos.puntoSeparador} />
              <Text style={estilos.dato}>{actividad.calorias} kcal</Text>
              <Text style={estilos.indicacion}>Deslizá ←</Text>
            </View>
          </View>
        </View>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedorDeslizable: {
    borderRadius: 23,
  },
  tarjeta: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E8E0',
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 108,
    padding: 14,
  },
  iconoActividad: {
    alignItems: 'center',
    borderRadius: 17,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  textoIconoActividad: {
    color: '#173F3B',
    fontSize: 10,
    fontWeight: '900',
  },
  contenido: {
    flex: 1,
    marginLeft: 13,
  },
  filaSuperior: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipoActividad: {
    color: '#173F3B',
    fontSize: 15,
    fontWeight: '900',
  },
  fecha: {
    color: '#7A8983',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  distancia: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  valorDistancia: {
    color: '#173F3B',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unidadDistancia: {
    color: '#7A8983',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  filaDatos: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 13,
  },
  dato: {
    color: '#5F716A',
    fontSize: 11,
    fontWeight: '700',
  },
  puntoSeparador: {
    backgroundColor: '#B7C2BD',
    borderRadius: 2,
    height: 4,
    marginHorizontal: 8,
    width: 4,
  },
  indicacion: {
    color: '#9AA7A2',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  accionEliminar: {
    alignItems: 'center',
    backgroundColor: '#D85D55',
    borderBottomRightRadius: 23,
    borderTopRightRadius: 23,
    justifyContent: 'center',
    width: 92,
  },
  iconoEliminar: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '500',
    lineHeight: 25,
  },
  textoEliminar: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 5,
  },
});
