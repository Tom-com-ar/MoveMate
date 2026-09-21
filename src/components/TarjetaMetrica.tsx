import { StyleSheet, Text, View } from 'react-native';

import { NumeroAnimado } from './NumeroAnimado';

type PropiedadesTarjetaMetrica = {
  colorAcento: string;
  decimales?: number;
  icono: string;
  etiqueta: string;
  retrasoAnimacion?: number;
  unidad: string;
  valor: number;
};

export function TarjetaMetrica({
  colorAcento,
  decimales = 0,
  icono,
  etiqueta,
  retrasoAnimacion = 0,
  unidad,
  valor,
}: PropiedadesTarjetaMetrica) {
  return (
    <View style={estilos.tarjeta}>
      <View style={[estilos.icono, { backgroundColor: colorAcento }]}>
        <Text style={estilos.textoIcono}>{icono}</Text>
      </View>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.filaValor}>
        <NumeroAnimado
          decimales={decimales}
          estilo={estilos.valor}
          retraso={retrasoAnimacion}
          valor={valor}
        />
        <Text style={estilos.unidad}>{unidad}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5EADF',
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 154,
    padding: 17,
  },
  icono: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  textoIcono: {
    color: '#173F3B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  etiqueta: {
    color: '#74827C',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 18,
  },
  filaValor: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 3,
  },
  valor: {
    color: '#173F3B',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  unidad: {
    color: '#74827C',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
});
