import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { nombresActividad, type TipoActividad } from './SelectorTipoActividad';

type DatosSimulacion = {
  distanciaKm: number;
  duracionMinutos: number;
};

type PropiedadesVentanaSimulacion = {
  alCerrar: () => void;
  alSimular: (datos: DatosSimulacion) => void;
  tipoActividad: TipoActividad;
  visible: boolean;
};

const valoresSugeridos: Record<TipoActividad, DatosSimulacion> = {
  bicicleta: { distanciaKm: 5, duracionMinutos: 25 },
  caminata: { distanciaKm: 1.5, duracionMinutos: 20 },
  carrera: { distanciaKm: 3, duracionMinutos: 20 },
};

export function VentanaSimulacion({
  alCerrar,
  alSimular,
  tipoActividad,
  visible,
}: PropiedadesVentanaSimulacion) {
  const bordesSeguros = useSafeAreaInsets();
  const valoresIniciales = valoresSugeridos[tipoActividad];
  const [distancia, setDistancia] = useState(() =>
    String(valoresIniciales.distanciaKm).replace('.', ','),
  );
  const [duracion, setDuracion] = useState(() =>
    String(valoresIniciales.duracionMinutos),
  );
  const [mensajeError, setMensajeError] = useState('');

  const confirmarSimulacion = () => {
    const distanciaKm = Number(distancia.replace(',', '.'));
    const duracionMinutos = Number(duracion.replace(',', '.'));

    if (!Number.isFinite(distanciaKm) || distanciaKm < 0.1 || distanciaKm > 50) {
      setMensajeError('La distancia debe estar entre 0,1 y 50 km.');
      return;
    }

    if (
      !Number.isFinite(duracionMinutos) ||
      duracionMinutos < 1 ||
      duracionMinutos > 300
    ) {
      setMensajeError('La duración debe estar entre 1 y 300 minutos.');
      return;
    }

    alSimular({ distanciaKm, duracionMinutos });
  };

  return (
    <Modal
      animationType="none"
      onRequestClose={alCerrar}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.modal}
      >
        <Animated.View entering={FadeIn.duration(120)} style={estilos.fondo}>
          <Pressable
            accessibilityLabel="Cerrar simulación"
            onPress={alCerrar}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(220).easing(Easing.out(Easing.cubic))}
          style={[
            estilos.panel,
            { paddingBottom: Math.max(bordesSeguros.bottom, 18) },
          ]}
        >
          <View style={estilos.indicador} />
          <View style={estilos.encabezado}>
            <View style={estilos.copiaEncabezado}>
              <Text style={estilos.sobretitulo}>MODO DE PRUEBA</Text>
              <Text style={estilos.titulo}>Simular recorrido</Text>
              <Text style={estilos.subtitulo}>
                Elegí los datos para {nombresActividad[tipoActividad].toLowerCase()}.
                La ruta será diferente en cada prueba.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              onPress={alCerrar}
              style={estilos.cerrar}
            >
              <Text style={estilos.textoCerrar}>×</Text>
            </Pressable>
          </View>

          <View style={estilos.campos}>
            <View style={estilos.grupoCampo}>
              <Text style={estilos.etiqueta}>DISTANCIA</Text>
              <View style={estilos.campoConUnidad}>
                <TextInput
                  accessibilityLabel="Distancia simulada en kilómetros"
                  keyboardType="decimal-pad"
                  onChangeText={setDistancia}
                  selectTextOnFocus
                  style={estilos.campo}
                  value={distancia}
                />
                <Text style={estilos.unidad}>km</Text>
              </View>
            </View>

            <View style={estilos.grupoCampo}>
              <Text style={estilos.etiqueta}>DURACIÓN</Text>
              <View style={estilos.campoConUnidad}>
                <TextInput
                  accessibilityLabel="Duración simulada en minutos"
                  keyboardType="number-pad"
                  onChangeText={setDuracion}
                  selectTextOnFocus
                  style={estilos.campo}
                  value={duracion}
                />
                <Text style={estilos.unidad}>min</Text>
              </View>
            </View>
          </View>

          <Text style={estilos.ayuda}>
            Las calorías se calculan automáticamente según la actividad.
          </Text>
          {!!mensajeError && <Text style={estilos.error}>{mensajeError}</Text>}

          <Pressable
            accessibilityRole="button"
            onPress={confirmarSimulacion}
            style={estilos.botonGenerar}
          >
            <Text style={estilos.textoBotonGenerar}>Generar recorrido distinto</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fondo: {
    backgroundColor: 'rgba(10, 31, 29, 0.56)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  panel: {
    backgroundColor: '#F7F8F3',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 11,
  },
  indicador: {
    alignSelf: 'center',
    backgroundColor: '#CBD2C9',
    borderRadius: 3,
    height: 5,
    marginBottom: 18,
    width: 42,
  },
  encabezado: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  copiaEncabezado: {
    flex: 1,
    paddingRight: 14,
  },
  sobretitulo: {
    color: '#6C7B75',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  titulo: {
    color: '#173F3B',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 5,
  },
  subtitulo: {
    color: '#74827C',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  cerrar: {
    alignItems: 'center',
    backgroundColor: '#E7EBDD',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  textoCerrar: {
    color: '#173F3B',
    fontSize: 25,
    lineHeight: 27,
  },
  campos: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  grupoCampo: {
    flex: 1,
  },
  etiqueta: {
    color: '#6C7B75',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 7,
    marginLeft: 3,
  },
  campoConUnidad: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE4DA',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    paddingRight: 13,
  },
  campo: {
    color: '#173F3B',
    flex: 1,
    fontSize: 19,
    fontWeight: '900',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  unidad: {
    color: '#74827C',
    fontSize: 11,
    fontWeight: '800',
  },
  ayuda: {
    color: '#74827C',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },
  error: {
    color: '#B9433D',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  botonGenerar: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    marginTop: 18,
  },
  textoBotonGenerar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
