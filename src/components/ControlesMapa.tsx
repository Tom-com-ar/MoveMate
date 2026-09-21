import { Pressable, StyleSheet, Text, View } from 'react-native';

type PropiedadesControlesMapa = {
  alAcercar: () => void;
  alAlejar: () => void;
  alCentrar: () => void;
  desplazamientoInferior: number;
};

export function ControlesMapa({
  alAcercar,
  alAlejar,
  alCentrar,
  desplazamientoInferior,
}: PropiedadesControlesMapa) {
  return (
    <View style={[estilos.contenedor, { bottom: desplazamientoInferior }]}>
      <View style={estilos.grupoZoom}>
        <Pressable
          accessibilityLabel="Acercar mapa"
          accessibilityRole="button"
          onPress={alAcercar}
          style={({ pressed }) => [
            estilos.boton,
            pressed && estilos.botonPresionado,
          ]}
        >
          <Text style={estilos.simbolo}>+</Text>
        </Pressable>
        <View style={estilos.separador} />
        <Pressable
          accessibilityLabel="Alejar mapa"
          accessibilityRole="button"
          onPress={alAlejar}
          style={({ pressed }) => [
            estilos.boton,
            pressed && estilos.botonPresionado,
          ]}
        >
          <Text style={estilos.simbolo}>−</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel="Centrar en mi ubicación"
        accessibilityRole="button"
        onPress={alCentrar}
        style={({ pressed }) => [
          estilos.boton,
          estilos.botonCentrar,
          pressed && estilos.botonPresionado,
        ]}
      >
        <Text style={estilos.simboloCentrar}>◎</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    right: 18,
  },
  grupoZoom: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    boxShadow: '0 6px 16px rgba(23, 63, 59, 0.18)',
    overflow: 'hidden',
  },
  boton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  botonPresionado: {
    backgroundColor: '#E9F0E5',
  },
  botonCentrar: {
    backgroundColor: '#173F3B',
    borderRadius: 22,
    boxShadow: '0 6px 16px rgba(23, 63, 59, 0.24)',
    marginTop: 10,
  },
  separador: {
    alignSelf: 'center',
    backgroundColor: '#DFE5DC',
    height: 1,
    width: 28,
  },
  simbolo: {
    color: '#173F3B',
    fontSize: 25,
    fontWeight: '500',
    lineHeight: 28,
  },
  simboloCentrar: {
    color: '#E9F478',
    fontSize: 25,
    fontWeight: '700',
  },
});
