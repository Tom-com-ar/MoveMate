import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { NumeroAnimado } from './NumeroAnimado';

type PropiedadesTarjetaProgresoDiario = {
  metaMinutos: number;
  minutosActuales: number;
};

export function TarjetaProgresoDiario({
  metaMinutos,
  minutosActuales,
}: PropiedadesTarjetaProgresoDiario) {
  const progreso = Math.min(minutosActuales / metaMinutos, 1);
  const progresoAnimado = useSharedValue(0);

  useEffect(() => {
    progresoAnimado.value = withDelay(
      540,
      withTiming(progreso, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progreso, progresoAnimado]);

  const estiloProgreso = useAnimatedStyle(() => ({
    width: `${progresoAnimado.value * 100}%`,
  }));

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.filaSuperior}>
        <View>
          <Text style={estilos.etiqueta}>MINUTOS ACTIVOS</Text>
          <View style={estilos.filaValor}>
            <NumeroAnimado
              estilo={estilos.valor}
              retraso={430}
              valor={minutosActuales}
            />
            <Text style={estilos.meta}> / {metaMinutos} min</Text>
          </View>
        </View>

        <View style={estilos.insigniaPorcentaje}>
          <NumeroAnimado
            estilo={estilos.porcentaje}
            retraso={430}
            sufijo="%"
            valor={Math.round(progreso * 100)}
          />
        </View>
      </View>

      <View style={estilos.pista}>
        <Animated.View style={[estilos.relleno, estiloProgreso]} />
      </View>

      <View style={estilos.filaInferior}>
        <Text style={estilos.textoInferior}>Te faltan</Text>
        <Text style={estilos.restante}>
          {Math.max(0, metaMinutos - minutosActuales)} min
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#173F3B',
    borderRadius: 28,
    boxShadow: '0 12px 22px rgba(23, 63, 59, 0.18)',
    padding: 22,
  },
  filaSuperior: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etiqueta: {
    color: '#A9C0B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  filaValor: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 9,
  },
  valor: {
    color: '#FFFFFF',
    fontSize: 37,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  meta: {
    color: '#9FB4AD',
    fontSize: 14,
    fontWeight: '700',
  },
  insigniaPorcentaje: {
    alignItems: 'center',
    backgroundColor: '#E9F478',
    borderRadius: 22,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  porcentaje: {
    color: '#173F3B',
    fontSize: 13,
    fontWeight: '900',
  },
  pista: {
    backgroundColor: '#315650',
    borderRadius: 8,
    height: 10,
    marginTop: 24,
    overflow: 'hidden',
  },
  relleno: {
    backgroundColor: '#E9F478',
    borderRadius: 8,
    height: '100%',
  },
  filaInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  textoInferior: {
    color: '#A9C0B8',
    fontSize: 12,
  },
  restante: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
