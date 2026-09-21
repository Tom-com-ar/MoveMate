import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BotonIniciarActividad } from './src/components/BotonIniciarActividad';
import { EntradaAnimada } from './src/components/EntradaAnimada';
import { PantallaSeguimientoGPS } from './src/components/PantallaSeguimientoGPS';
import {
  SelectorTipoActividad,
  TipoActividad,
} from './src/components/SelectorTipoActividad';
import { TarjetaMetrica } from './src/components/TarjetaMetrica';
import { TarjetaProgresoDiario } from './src/components/TarjetaProgresoDiario';
import { dashboardSummary } from './src/data/dashboard';

export default function App() {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [actividadActual, setActividadActual] = useState<TipoActividad | null>(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);

  const iniciarActividad = (tipo: TipoActividad) => {
    setActividadActual(tipo);
    setSelectorVisible(false);
    setSeguimientoActivo(true);
  };

  const finalizarActividad = () => {
    setSeguimientoActivo(false);
    setActividadActual(null);
  };

  return (
    <SafeAreaProvider>
      {seguimientoActivo && actividadActual ? (
        <PantallaSeguimientoGPS
          alFinalizar={finalizarActividad}
          tipoActividad={actividadActual}
        />
      ) : (
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

              <View style={styles.datePill}>
                <Text style={styles.dateText}>{dashboardSummary.dateLabel}</Text>
              </View>
            </View>
          </EntradaAnimada>

          <EntradaAnimada retraso={170}>
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>TU RESUMEN DE HOY</Text>
              <Text style={styles.title}>Moverte un poco{`\n`}también cuenta.</Text>
              <Text style={styles.subtitle}>
                Cada paso suma. Mirá cómo viene tu día.
              </Text>
            </View>
          </EntradaAnimada>

          <EntradaAnimada retraso={280}>
            <TarjetaProgresoDiario
              pasosActuales={dashboardSummary.steps}
              metaPasos={dashboardSummary.stepGoal}
            />
          </EntradaAnimada>

          <View style={styles.metricsRow}>
            <EntradaAnimada retraso={390} estilo={styles.metricItem}>
              <TarjetaMetrica
                colorAcento="#69C9B0"
                icono="KM"
                etiqueta="Distancia"
                unidad="km"
                valor={dashboardSummary.distanceKm.toFixed(1)}
              />
            </EntradaAnimada>

            <EntradaAnimada retraso={500} estilo={styles.metricItem}>
              <TarjetaMetrica
                colorAcento="#FFAA75"
                icono="KCAL"
                etiqueta="Calorías"
                unidad="kcal"
                valor={dashboardSummary.calories.toLocaleString('es-AR')}
              />
            </EntradaAnimada>
          </View>

          <EntradaAnimada retraso={610}>
            <View style={styles.motivationCard}>
              <View style={styles.motivationIcon}>
                <Text style={styles.motivationIconText}>3</Text>
              </View>
              <View style={styles.motivationCopy}>
                <Text style={styles.motivationTitle}>Racha en movimiento</Text>
                <Text style={styles.motivationText}>
                  Llevás 3 días cumpliendo tu objetivo. ¡Seguí así!
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
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
  datePill: {
    backgroundColor: '#E7EBDD',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  dateText: {
    color: '#52645E',
    fontSize: 12,
    fontWeight: '700',
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
