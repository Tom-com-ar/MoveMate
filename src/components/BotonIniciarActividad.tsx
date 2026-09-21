import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TipoActividad, nombresActividad } from './SelectorTipoActividad';

type PropiedadesBotonIniciarActividad = {
  actividadActual: TipoActividad | null;
  alPresionar: () => void;
};

export function BotonIniciarActividad({
  actividadActual,
  alPresionar,
}: PropiedadesBotonIniciarActividad) {
  const bordesSeguros = useSafeAreaInsets();
  const escala = useSharedValue(1);
  const pulso = useSharedValue(0);

  useEffect(() => {
    pulso.set(withRepeat(withTiming(1, { duration: 1150 }), -1, true));

    return () => cancelAnimation(pulso);
  }, [pulso]);

  const estiloBoton = useAnimatedStyle(() => ({
    transform: [{ scale: escala.get() }],
  }));

  const estiloPulso = useAnimatedStyle(() => ({
    opacity: 0.26 - pulso.get() * 0.18,
    transform: [{ scale: 1 + pulso.get() * 0.2 }],
  }));

  const textoBoton = actividadActual
    ? `${nombresActividad[actividadActual]} iniciada`
    : 'Iniciar actividad';

  return (
    <View
      style={[estilos.contenedor, { bottom: bordesSeguros.bottom + 18 }]}
    >
      <Animated.View style={[estilos.pulso, estiloPulso]} />
      <Pressable
        accessibilityLabel={textoBoton}
        accessibilityRole="button"
        hitSlop={8}
        onPress={alPresionar}
        onPressIn={() => {
          escala.set(withSpring(0.94, { damping: 16, stiffness: 240 }));
        }}
        onPressOut={() => {
          escala.set(withSpring(1, { damping: 14, stiffness: 210 }));
        }}
      >
        <Animated.View style={[estilos.boton, estiloBoton]}>
          <View style={estilos.icono}>
            <Text style={estilos.textoIcono}>{actividadActual ? '✓' : '+'}</Text>
          </View>
          <Text style={estilos.texto}>{textoBoton}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'flex-end',
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  pulso: {
    backgroundColor: '#BFD64F',
    borderRadius: 29,
    bottom: 0,
    height: 58,
    position: 'absolute',
    right: 0,
    width: 184,
  },
  boton: {
    alignItems: 'center',
    backgroundColor: '#E9F478',
    borderRadius: 29,
    boxShadow: '0 10px 22px rgba(23, 63, 59, 0.24)',
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 9,
    paddingRight: 18,
  },
  icono: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    marginRight: 10,
    width: 42,
  },
  textoIcono: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 27,
  },
  texto: {
    color: '#173F3B',
    fontSize: 13,
    fontWeight: '900',
  },
});
