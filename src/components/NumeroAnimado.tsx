import { useEffect, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type PropiedadesNumeroAnimado = {
  decimales?: number;
  estilo?: StyleProp<TextStyle>;
  retraso?: number;
  sufijo?: string;
  valor: number;
};

export function NumeroAnimado({
  decimales = 0,
  estilo,
  retraso = 0,
  sufijo = '',
  valor,
}: PropiedadesNumeroAnimado) {
  const factor = 10 ** decimales;
  const progreso = useSharedValue(0);
  const [valorMostrado, setValorMostrado] = useState(0);

  useEffect(() => {
    progreso.set(
      withDelay(
        retraso,
        withTiming(valor, {
          duration: 760,
          easing: Easing.out(Easing.cubic),
        }),
      ),
    );

    return () => cancelAnimation(progreso);
  }, [progreso, retraso, valor]);

  useAnimatedReaction(
    () => Math.round(progreso.get() * factor) / factor,
    (valorActual, valorAnterior) => {
      if (valorActual !== valorAnterior) {
        runOnJS(setValorMostrado)(valorActual);
      }
    },
    [factor],
  );

  const texto = valorMostrado.toLocaleString('es-AR', {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  });

  return (
    <Text style={estilo}>
      {texto}
      {sufijo}
    </Text>
  );
}
