import { PropsWithChildren, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type PropiedadesEntradaAnimada = PropsWithChildren<{
  retraso?: number;
  estilo?: StyleProp<ViewStyle>;
}>;

export function EntradaAnimada({
  children: contenido,
  retraso = 0,
  estilo,
}: PropiedadesEntradaAnimada) {
  const opacidad = useSharedValue(0);
  const desplazamientoY = useSharedValue(18);

  useEffect(() => {
    opacidad.value = withDelay(
      retraso,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
    desplazamientoY.value = withDelay(
      retraso,
      withTiming(0, { duration: 580, easing: Easing.out(Easing.cubic) }),
    );
  }, [desplazamientoY, opacidad, retraso]);

  const estiloAnimado = useAnimatedStyle(() => ({
    opacity: opacidad.value,
    transform: [{ translateY: desplazamientoY.value }],
  }));

  return (
    <Animated.View style={[estilo, estiloAnimado]}>{contenido}</Animated.View>
  );
}
