import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TipoActividad = 'bicicleta' | 'caminata' | 'carrera';

export const nombresActividad: Record<TipoActividad, string> = {
  bicicleta: 'Bicicleta',
  caminata: 'Caminata',
  carrera: 'Carrera',
};

type OpcionActividad = {
  color: string;
  descripcion: string;
  icono: string;
  tipo: TipoActividad;
};

const opcionesActividad: OpcionActividad[] = [
  {
    color: '#CFEBDD',
    descripcion: 'Un ritmo tranquilo para sumar movimiento.',
    icono: 'CAM',
    tipo: 'caminata',
  },
  {
    color: '#FFD6BA',
    descripcion: 'Más intensidad para superar tus marcas.',
    icono: 'COR',
    tipo: 'carrera',
  },
  {
    color: '#D9D8FF',
    descripcion: 'Recorré más distancia sobre dos ruedas.',
    icono: 'BICI',
    tipo: 'bicicleta',
  },
];

type PropiedadesSelectorTipoActividad = {
  actividadActual: TipoActividad | null;
  alCerrar: () => void;
  alIniciar: (tipo: TipoActividad) => void;
  visible: boolean;
};

export function SelectorTipoActividad({
  actividadActual,
  alCerrar,
  alIniciar,
  visible,
}: PropiedadesSelectorTipoActividad) {
  const bordesSeguros = useSafeAreaInsets();
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoActividad>(
    actividadActual ?? 'caminata',
  );

  return (
    <Modal
      animationType="none"
      onRequestClose={alCerrar}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={estilos.modal}>
        <Animated.View entering={FadeIn.duration(120)} style={estilos.fondo}>
          <Pressable
            accessibilityLabel="Cerrar selector de actividad"
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
              <Text style={estilos.sobretitulo}>NUEVA SESIÓN</Text>
              <Text style={estilos.titulo}>¿Cómo te vas a mover?</Text>
              <Text style={estilos.subtitulo}>
                Elegí una actividad para comenzar.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              hitSlop={8}
              onPress={alCerrar}
              style={estilos.cerrar}
            >
              <Text style={estilos.textoCerrar}>×</Text>
            </Pressable>
          </View>

          <View style={estilos.opciones}>
            {opcionesActividad.map((opcion) => {
              const estaSeleccionada = opcion.tipo === tipoSeleccionado;

              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: estaSeleccionada }}
                  key={opcion.tipo}
                  onPress={() => setTipoSeleccionado(opcion.tipo)}
                  style={[
                    estilos.opcion,
                    estaSeleccionada && estilos.opcionSeleccionada,
                  ]}
                >
                  <View
                    style={[
                      estilos.iconoOpcion,
                      { backgroundColor: opcion.color },
                    ]}
                  >
                    <Text style={estilos.textoIcono}>{opcion.icono}</Text>
                  </View>
                  <View style={estilos.copiaOpcion}>
                    <Text style={estilos.tituloOpcion}>
                      {nombresActividad[opcion.tipo]}
                    </Text>
                    <Text style={estilos.descripcionOpcion}>
                      {opcion.descripcion}
                    </Text>
                  </View>
                  <View
                    style={[
                      estilos.radio,
                      estaSeleccionada && estilos.radioSeleccionado,
                    ]}
                  >
                    {estaSeleccionada && <View style={estilos.puntoRadio} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            android_ripple={{ color: '#BCCE4D' }}
            onPress={() => alIniciar(tipoSeleccionado)}
            style={estilos.botonComenzar}
          >
            <Text style={estilos.textoBotonComenzar}>
              Comenzar {nombresActividad[tipoSeleccionado].toLowerCase()}
            </Text>
            <Text style={estilos.flechaBoton}>→</Text>
          </Pressable>
        </Animated.View>
      </View>
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
    justifyContent: 'space-between',
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
    fontSize: 13,
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
    fontWeight: '400',
    lineHeight: 27,
  },
  opciones: {
    gap: 10,
    marginTop: 20,
  },
  opcion: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E6DE',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 74,
    padding: 11,
  },
  opcionSeleccionada: {
    backgroundColor: '#F2F6D5',
    borderColor: '#BFD257',
    borderWidth: 2,
    padding: 10,
  },
  iconoOpcion: {
    alignItems: 'center',
    borderRadius: 15,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  textoIcono: {
    color: '#173F3B',
    fontSize: 10,
    fontWeight: '900',
  },
  copiaOpcion: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  tituloOpcion: {
    color: '#173F3B',
    fontSize: 15,
    fontWeight: '900',
  },
  descripcionOpcion: {
    color: '#74827C',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#B8C2BC',
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioSeleccionado: {
    borderColor: '#173F3B',
  },
  puntoRadio: {
    backgroundColor: '#173F3B',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  botonComenzar: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 20,
    flexDirection: 'row',
    height: 58,
    justifyContent: 'center',
    marginTop: 18,
    overflow: 'hidden',
  },
  textoBotonComenzar: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  flechaBoton: {
    color: '#E9F478',
    fontSize: 21,
    fontWeight: '700',
    marginLeft: 9,
  },
});
