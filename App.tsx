import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BotonIniciarActividad } from './src/components/BotonIniciarActividad';
import { EntradaAnimada } from './src/components/EntradaAnimada';
import { PantallaAcceso } from './src/components/PantallaAcceso';
import { PantallaHistorial } from './src/components/PantallaHistorial';
import { PantallaSeguimientoGPS } from './src/components/PantallaSeguimientoGPS';
import {
  SelectorTipoActividad,
  TipoActividad,
} from './src/components/SelectorTipoActividad';
import { TarjetaMetrica } from './src/components/TarjetaMetrica';
import { TarjetaProgresoDiario } from './src/components/TarjetaProgresoDiario';
import { useSesionSupabase } from './src/hooks/useSesionSupabase';
import {
  guardarActividadEnNube,
  obtenerResumenDeInicio,
} from './src/servicios/actividadesNube';
import { supabase, supabaseConfigurado } from './src/servicios/supabase';
import type { ActividadCompletada } from './src/types/actividad';
import { crearResumenInicioVacio } from './src/types/resumenInicio';

export default function App() {
  const { cargandoSesion, sesion } = useSesionSupabase();
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [actividadActual, setActividadActual] = useState<TipoActividad | null>(null);
  const [historialVisible, setHistorialVisible] = useState(false);
  const [mensajeResumen, setMensajeResumen] = useState('');
  const [resumenInicio, setResumenInicio] = useState(crearResumenInicioVacio);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);

  const cargarResumen = useCallback(async () => {
    if (!sesion?.user.id) {
      setResumenInicio(crearResumenInicioVacio());
      return;
    }

    try {
      setMensajeResumen('');
      const resumen = await obtenerResumenDeInicio(sesion.user.id);
      setResumenInicio(resumen);
    } catch {
      setMensajeResumen('No pudimos actualizar el resumen de hoy.');
    }
  }, [sesion?.user.id]);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  const iniciarActividad = (tipo: TipoActividad) => {
    setActividadActual(tipo);
    setSelectorVisible(false);
    setSeguimientoActivo(true);
  };

  const cancelarActividad = () => {
    setSeguimientoActivo(false);
    setActividadActual(null);
  };

  const finalizarActividad = (actividad: ActividadCompletada) => {
    cancelarActividad();

    if (sesion?.user.id) {
      void guardarActividadEnNube(actividad, sesion.user.id)
        .then(async () => {
          await cargarResumen();
          Alert.alert(
            'Actividad sincronizada',
            'Tu recorrido ya está guardado en Supabase.',
          );
        })
        .catch(() => {
          Alert.alert(
            'No se pudo sincronizar',
            'Revisá tu conexión. La actividad no se guardó en la nube.',
          );
        });
    }
  };

  const cerrarSesion = () => {
    setHistorialVisible(false);
    setResumenInicio(crearResumenInicioVacio());
    if (supabase) {
      void supabase.auth.signOut({ scope: 'local' });
    }
  };

  return (
    <GestureHandlerRootView style={styles.raiz}>
      <SafeAreaProvider>
      {supabaseConfigurado && cargandoSesion ? (
        <View style={styles.cargandoSesion}>
          <StatusBar style="light" />
          <ActivityIndicator color="#E9F478" size="large" />
          <Text style={styles.textoCargandoSesion}>Recuperando tu sesión...</Text>
        </View>
      ) : supabaseConfigurado && !sesion ? (
        <PantallaAcceso />
      ) : seguimientoActivo && actividadActual ? (
        <Animated.View
          entering={FadeIn.duration(260).easing(Easing.out(Easing.cubic))}
          style={styles.pantallaAnimada}
        >
          <PantallaSeguimientoGPS
            alCancelar={cancelarActividad}
            alFinalizar={finalizarActividad}
            tipoActividad={actividadActual}
          />
        </Animated.View>
      ) : historialVisible ? (
        <Animated.View
          entering={FadeIn.duration(260).easing(Easing.out(Easing.cubic))}
          style={styles.pantallaAnimada}
        >
          <PantallaHistorial
            alVolver={() => {
              setHistorialVisible(false);
              void cargarResumen();
            }}
            usuarioId={sesion?.user.id}
          />
        </Animated.View>
      ) : (
      <Animated.View
        entering={FadeIn.duration(260).easing(Easing.out(Easing.cubic))}
        style={styles.pantallaAnimada}
      >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <EntradaAnimada retraso={80}>
            <View style={styles.header}>
              <View style={styles.brand}>
                <View style={styles.logoMark}>
                  <Text style={styles.logoLetter}>M</Text>
                </View>
                <Text style={styles.brandName}>MoveMate</Text>
              </View>

              <View style={styles.accionesEncabezado}>
                <Pressable
                  accessibilityLabel="Abrir historial"
                  accessibilityRole="button"
                  onPress={() => setHistorialVisible(true)}
                  style={({ pressed }) => [
                    styles.botonHistorial,
                    pressed && styles.botonHistorialPresionado,
                  ]}
                >
                  <Text style={styles.textoHistorial}>Historial</Text>
                </Pressable>
                {sesion && (
                  <Pressable
                    accessibilityLabel="Cerrar sesión"
                    accessibilityRole="button"
                    onPress={cerrarSesion}
                    style={({ pressed }) => [
                      styles.botonCerrarSesion,
                      pressed && styles.botonCerrarSesionPresionado,
                    ]}
                  >
                    <Text style={styles.textoCerrarSesion}>Cerrar sesión</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </EntradaAnimada>

          <EntradaAnimada retraso={170}>
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>
                {resumenInicio.fechaEtiqueta} · TU RESUMEN
              </Text>
              <Text style={styles.title}>Moverte un poco{`\n`}también cuenta.</Text>
              <Text style={styles.subtitle}>
                Cada paso suma. Mirá cómo viene tu día.
              </Text>
              {!!mensajeResumen && (
                <Text style={styles.mensajeResumen}>{mensajeResumen}</Text>
              )}
            </View>
          </EntradaAnimada>

          <EntradaAnimada retraso={280}>
            <TarjetaProgresoDiario
              metaMinutos={resumenInicio.metaMinutos}
              minutosActuales={resumenInicio.minutosActivos}
            />
          </EntradaAnimada>

          <View style={styles.metricsRow}>
            <EntradaAnimada retraso={390} estilo={styles.metricItem}>
              <TarjetaMetrica
                colorAcento="#69C9B0"
                decimales={1}
                icono="KM"
                etiqueta="Distancia"
                retrasoAnimacion={520}
                unidad="km"
                valor={resumenInicio.distanciaKm}
              />
            </EntradaAnimada>

            <EntradaAnimada retraso={500} estilo={styles.metricItem}>
              <TarjetaMetrica
                colorAcento="#FFAA75"
                icono="KCAL"
                etiqueta="Calorías"
                retrasoAnimacion={630}
                unidad="kcal"
                valor={resumenInicio.calorias}
              />
            </EntradaAnimada>
          </View>

          <EntradaAnimada retraso={610}>
            <View style={styles.motivationCard}>
              <View style={styles.motivationIcon}>
                <Text style={styles.motivationIconText}>
                  {resumenInicio.rachaDias}
                </Text>
              </View>
              <View style={styles.motivationCopy}>
                <Text style={styles.motivationTitle}>Racha en movimiento</Text>
                <Text style={styles.motivationText}>
                  {resumenInicio.rachaDias > 0
                    ? `Llevás ${resumenInicio.rachaDias} ${
                        resumenInicio.rachaDias === 1 ? 'día' : 'días'
                      } registrando actividad. ¡Seguí así!`
                    : 'Completá una actividad para comenzar tu racha.'}
                </Text>
              </View>
              <Text style={styles.arrow}>↗</Text>
            </View>
          </EntradaAnimada>
        </ScrollView>

        <BotonIniciarActividad
          actividadActual={actividadActual}
          alPresionar={() => setSelectorVisible(true)}
        />

        <SelectorTipoActividad
          actividadActual={actividadActual}
          alCerrar={() => setSelectorVisible(false)}
          alIniciar={iniciarActividad}
          visible={selectorVisible}
        />
      </SafeAreaView>
      </Animated.View>
      )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  pantallaAnimada: {
    flex: 1,
  },
  cargandoSesion: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    flex: 1,
    justifyContent: 'center',
  },
  textoCargandoSesion: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6EF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 116,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 13,
    height: 38,
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
    width: 38,
  },
  logoLetter: {
    color: '#E7F46D',
    fontSize: 19,
    fontWeight: '900',
  },
  brandName: {
    color: '#173F3B',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  accionesEncabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  botonHistorial: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  botonHistorialPresionado: {
    backgroundColor: '#2F5751',
  },
  textoHistorial: {
    color: '#E9F478',
    fontSize: 10,
    fontWeight: '900',
  },
  botonCerrarSesion: {
    alignItems: 'center',
    borderColor: '#C9D2C8',
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  botonCerrarSesionPresionado: {
    backgroundColor: '#E5EADD',
  },
  textoCerrarSesion: {
    color: '#536760',
    fontSize: 9,
    fontWeight: '900',
  },
  intro: {
    marginBottom: 22,
    marginTop: 34,
  },
  eyebrow: {
    color: '#59706A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 10,
  },
  title: {
    color: '#123532',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.6,
    lineHeight: 41,
  },
  subtitle: {
    color: '#6C7B75',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  mensajeResumen: {
    color: '#A04E43',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  metricItem: {
    flex: 1,
  },
  motivationCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5EADF',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    padding: 16,
  },
  motivationIcon: {
    alignItems: 'center',
    backgroundColor: '#E9F478',
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    marginRight: 13,
    width: 46,
  },
  motivationIconText: {
    color: '#173F3B',
    fontSize: 18,
    fontWeight: '900',
  },
  motivationCopy: {
    flex: 1,
  },
  motivationTitle: {
    color: '#173F3B',
    fontSize: 14,
    fontWeight: '800',
  },
  motivationText: {
    color: '#74827C',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  arrow: {
    color: '#173F3B',
    fontSize: 19,
    fontWeight: '700',
    marginLeft: 8,
  },
});
