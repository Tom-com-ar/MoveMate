import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ControlesMapa } from './ControlesMapa';
import {
  MapaRecorridoExpoGo,
  ReferenciaMapaRecorridoExpoGo,
} from './MapaRecorridoExpoGo';
import { nombresActividad, TipoActividad } from './SelectorTipoActividad';
import { VentanaSimulacion } from './VentanaSimulacion';
import type { ActividadCompletada } from '../types/actividad';

type EstadoSeguimiento =
  | 'activo'
  | 'buscando'
  | 'error'
  | 'sin_permiso'
  | 'solicitando';

type PropiedadesPantallaSeguimientoGPS = {
  alCancelar: () => void;
  alFinalizar: (actividad: ActividadCompletada) => void;
  tipoActividad: TipoActividad;
};

function convertirCoordenadas(
  ubicacion: Location.LocationObject,
): LatLng {
  return {
    latitude: ubicacion.coords.latitude,
    longitude: ubicacion.coords.longitude,
  };
}

function calcularDistanciaEntrePuntos(inicio: LatLng, fin: LatLng) {
  const radioTierra = 6_371_000;
  const convertirARadianes = (grados: number) => (grados * Math.PI) / 180;
  const diferenciaLatitud = convertirARadianes(fin.latitude - inicio.latitude);
  const diferenciaLongitud = convertirARadianes(fin.longitude - inicio.longitude);
  const latitudInicio = convertirARadianes(inicio.latitude);
  const latitudFin = convertirARadianes(fin.latitude);
  const calculo =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(latitudInicio) *
      Math.cos(latitudFin) *
      Math.sin(diferenciaLongitud / 2) ** 2;

  return radioTierra * 2 * Math.atan2(Math.sqrt(calculo), Math.sqrt(1 - calculo));
}

function calcularDistanciaRecorrido(ruta: LatLng[]) {
  return ruta.slice(1).reduce(
    (distancia, punto, indice) =>
      distancia + calcularDistanciaEntrePuntos(ruta[indice], punto),
    0,
  );
}

const caloriasPorMinuto: Record<TipoActividad, number> = {
  bicicleta: 8,
  caminata: 4,
  carrera: 10,
};

export function PantallaSeguimientoGPS({
  alCancelar,
  alFinalizar,
  tipoActividad,
}: PropiedadesPantallaSeguimientoGPS) {
  const bordesSeguros = useSafeAreaInsets();
  const referenciaMapa = useRef<MapView>(null);
  const referenciaMapaExpoGo = useRef<ReferenciaMapaRecorridoExpoGo>(null);
  const duracionSimuladaSegundosRef = useRef<number | null>(null);
  const origenSimulacionRef = useRef<LatLng | null>(null);
  const simulacionActivaRef = useRef(false);
  const [estado, setEstado] = useState<EstadoSeguimiento>('solicitando');
  const [intento, setIntento] = useState(0);
  const [mensajeError, setMensajeError] = useState('');
  const [posicionActual, setPosicionActual] = useState<LatLng | null>(null);
  const [precision, setPrecision] = useState<number | null>(null);
  const [ruta, setRuta] = useState<LatLng[]>([]);
  const [simulacionActiva, setSimulacionActiva] = useState(false);
  const [ventanaSimulacionVisible, setVentanaSimulacionVisible] = useState(false);
  const [inicioActividad] = useState(() => new Date());
  const usarMapaAlternativo =
    Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const cambiarZoom = async (incremento: number) => {
    if (usarMapaAlternativo) {
      if (incremento > 0) {
        referenciaMapaExpoGo.current?.acercar();
      } else {
        referenciaMapaExpoGo.current?.alejar();
      }
      return;
    }

    const camara = await referenciaMapa.current?.getCamera();
    if (!camara) {
      return;
    }

    referenciaMapa.current?.animateCamera(
      { zoom: Math.max(3, Math.min((camara.zoom ?? 16) + incremento, 20)) },
      { duration: 220 },
    );
  };

  const centrarMapa = () => {
    if (!posicionActual) {
      return;
    }

    if (usarMapaAlternativo) {
      referenciaMapaExpoGo.current?.centrar();
      return;
    }

    referenciaMapa.current?.animateCamera(
      { center: posicionActual, zoom: 16 },
      { duration: 300 },
    );
  };

  const simularRecorrido = ({
    distanciaKm,
    duracionMinutos,
  }: {
    distanciaKm: number;
    duracionMinutos: number;
  }) => {
    if (!posicionActual) {
      return;
    }

    const origen = origenSimulacionRef.current ?? ruta[0] ?? posicionActual;
    origenSimulacionRef.current = origen;
    const metrosPorGradoLatitud = 111_320;
    const metrosPorGradoLongitud = Math.max(
      20_000,
      metrosPorGradoLatitud * Math.cos((origen.latitude * Math.PI) / 180),
    );
    const distanciaMetros = distanciaKm * 1000;
    const cantidadTramos = Math.max(
      8,
      Math.min(60, Math.round(distanciaMetros / 150)),
    );
    const distanciaPorTramo = distanciaMetros / cantidadTramos;
    let rumbo = Math.random() * Math.PI * 2;
    let puntoAnterior = origen;
    const puntosSimulados = Array.from({ length: cantidadTramos }, () => {
      rumbo += (Math.random() - 0.5) * 1.15;
      const norte = Math.cos(rumbo) * distanciaPorTramo;
      const este = Math.sin(rumbo) * distanciaPorTramo;
      const nuevoPunto = {
        latitude: puntoAnterior.latitude + norte / metrosPorGradoLatitud,
        longitude: puntoAnterior.longitude + este / metrosPorGradoLongitud,
      };
      puntoAnterior = nuevoPunto;
      return nuevoPunto;
    });
    const rutaSimulada = [origen, ...puntosSimulados];

    simulacionActivaRef.current = true;
    duracionSimuladaSegundosRef.current = Math.round(duracionMinutos * 60);
    setSimulacionActiva(true);
    setVentanaSimulacionVisible(false);
    setPrecision(null);
    setRuta(rutaSimulada);
    setPosicionActual(puntosSimulados[puntosSimulados.length - 1]);

    if (usarMapaAlternativo) {
      setTimeout(() => referenciaMapaExpoGo.current?.encuadrar(), 120);
    } else {
      referenciaMapa.current?.fitToCoordinates(rutaSimulada, {
        animated: true,
        edgePadding: { bottom: 180, left: 55, right: 55, top: 170 },
      });
    }
  };

  const finalizarSeguimiento = () => {
    const finalActividad = new Date();
    const duracionSegundos =
      duracionSimuladaSegundosRef.current ??
      Math.max(
        1,
        Math.round((finalActividad.getTime() - inicioActividad.getTime()) / 1000),
      );
    const inicioRegistrado = duracionSimuladaSegundosRef.current
      ? new Date(finalActividad.getTime() - duracionSegundos * 1000)
      : inicioActividad;
    const distanciaMetros = calcularDistanciaRecorrido(ruta);
    const calorias = Math.max(
      1,
      Math.round((duracionSegundos / 60) * caloriasPorMinuto[tipoActividad]),
    );

    alFinalizar({
      calorias,
      distanciaMetros,
      duracionSegundos,
      finalizadaEn: finalActividad.toISOString(),
      iniciadaEn: inicioRegistrado.toISOString(),
      ruta,
      tipo: tipoActividad,
    });
  };

  useEffect(() => {
    let pantallaActiva = true;
    let suscripcion: Location.LocationSubscription | null = null;

    async function comenzarSeguimiento() {
      try {
        setEstado('solicitando');
        setMensajeError('');

        const serviciosActivos = await Location.hasServicesEnabledAsync();
        if (!serviciosActivos) {
          if (pantallaActiva) {
            setMensajeError('Activá la ubicación del teléfono para registrar tu recorrido.');
            setEstado('error');
          }
          return;
        }

        const permiso = await Location.requestForegroundPermissionsAsync();
        if (permiso.status !== Location.PermissionStatus.GRANTED) {
          if (pantallaActiva) {
            setEstado('sin_permiso');
          }
          return;
        }

        if (pantallaActiva) {
          setEstado('buscando');
        }

        const primeraUbicacion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!pantallaActiva) {
          return;
        }

        const primeraCoordenada = convertirCoordenadas(primeraUbicacion);
        setPosicionActual(primeraCoordenada);
        setPrecision(primeraUbicacion.coords.accuracy);
        setRuta([primeraCoordenada]);
        setEstado('activo');

        const nuevaSuscripcion = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 1000,
          },
          (ubicacion) => {
            if (!pantallaActiva || simulacionActivaRef.current) {
              return;
            }

            const nuevaCoordenada = convertirCoordenadas(ubicacion);
            setPosicionActual(nuevaCoordenada);
            setPrecision(ubicacion.coords.accuracy);
            setRuta((rutaAnterior) => [...rutaAnterior, nuevaCoordenada]);
            referenciaMapa.current?.animateCamera(
              { center: nuevaCoordenada },
              { duration: 500 },
            );
          },
          (motivo) => {
            if (pantallaActiva) {
              setMensajeError(motivo);
              setEstado('error');
            }
          },
        );

        if (pantallaActiva) {
          suscripcion = nuevaSuscripcion;
        } else {
          nuevaSuscripcion.remove();
        }
      } catch {
        if (pantallaActiva) {
          setMensajeError('No pudimos iniciar el GPS. Revisá la ubicación e intentá otra vez.');
          setEstado('error');
        }
      }
    }

    void comenzarSeguimiento();

    return () => {
      pantallaActiva = false;
      suscripcion?.remove();
    };
  }, [intento]);

  if (!posicionActual) {
    const permisoDenegado = estado === 'sin_permiso';
    const huboError = estado === 'error';

    return (
      <View style={estilos.estadoPantalla}>
        <StatusBar style="light" />
        <View style={estilos.marca}>
          <Text style={estilos.letraMarca}>M</Text>
        </View>

        {!permisoDenegado && !huboError ? (
          <>
            <ActivityIndicator color="#E9F478" size="large" />
            <Text style={estilos.tituloEstado}>
              {estado === 'solicitando'
                ? 'Preparando tu ubicación'
                : 'Buscando señal GPS'}
            </Text>
            <Text style={estilos.textoEstado}>
              Esto puede demorar unos segundos si estás bajo techo.
            </Text>
          </>
        ) : (
          <>
            <View style={estilos.iconoAviso}>
              <Text style={estilos.textoIconoAviso}>!</Text>
            </View>
            <Text style={estilos.tituloEstado}>
              {permisoDenegado ? 'Necesitamos tu ubicación' : 'No encontramos el GPS'}
            </Text>
            <Text style={estilos.textoEstado}>
              {permisoDenegado
                ? 'Permití el acceso a la ubicación para dibujar tu recorrido en vivo.'
                : mensajeError}
            </Text>
            {huboError && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setIntento((valor) => valor + 1)}
                style={estilos.botonReintentar}
              >
                <Text style={estilos.textoBotonReintentar}>Reintentar</Text>
              </Pressable>
            )}
          </>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={alCancelar}
          style={estilos.botonVolver}
        >
          <Text style={estilos.textoBotonVolver}>Volver al inicio</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <StatusBar style="dark" />
      {usarMapaAlternativo ? (
        <MapaRecorridoExpoGo
          posicionActual={posicionActual}
          ref={referenciaMapaExpoGo}
          ruta={ruta}
        />
      ) : (
        <MapView
          initialRegion={{
            latitude: posicionActual.latitude,
            latitudeDelta: 0.008,
            longitude: posicionActual.longitude,
            longitudeDelta: 0.008,
          }}
          loadingBackgroundColor="#E7ECE5"
          loadingEnabled
          loadingIndicatorColor="#173F3B"
          mapType="standard"
          ref={referenciaMapa}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation
          style={estilos.mapa}
          userInterfaceStyle="light"
        >
          <Polyline
            coordinates={ruta}
            lineCap="round"
            lineJoin="round"
            strokeColor="#173F3B"
            strokeWidth={6}
          />
          <Marker coordinate={ruta[0]} title="Inicio" />
        </MapView>
      )}

      <ControlesMapa
        alAcercar={() => void cambiarZoom(1)}
        alAlejar={() => void cambiarZoom(-1)}
        alCentrar={centrarMapa}
        desplazamientoInferior={bordesSeguros.bottom + 106}
      />

      <View style={[estilos.encabezadoMapa, { top: bordesSeguros.top + 12 }]}>
        <View style={estilos.tipoActividad}>
          <View style={estilos.puntoActivo} />
          <View>
            <Text style={estilos.sobretituloMapa}>
              {simulacionActiva ? 'MODO PRUEBA' : 'GPS ACTIVO'}
            </Text>
            <Text style={estilos.tituloMapa}>{nombresActividad[tipoActividad]}</Text>
          </View>
        </View>
        <View style={estilos.precision}>
          <Text style={estilos.textoPrecision}>
            {simulacionActiva
              ? 'SIMULADO'
              : precision === null
                ? 'GPS'
                : `±${Math.round(precision)} m`}
          </Text>
        </View>
      </View>

      <View
        pointerEvents="box-none"
        style={[estilos.contenedorSimulacion, { top: bordesSeguros.top + 78 }]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => setVentanaSimulacionVisible(true)}
          style={[
            estilos.botonSimulacion,
            simulacionActiva && estilos.botonSimulacionActivo,
          ]}
        >
          <Text style={estilos.textoBotonSimulacion}>
            {simulacionActiva ? 'Cambiar simulación' : 'Simular recorrido'}
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          estilos.panelInferior,
          { paddingBottom: Math.max(bordesSeguros.bottom, 18) },
        ]}
      >
        <View>
          <Text style={estilos.etiquetaRuta}>RECORRIDO EN VIVO</Text>
          <Text style={estilos.puntosRuta}>
            {ruta.length} {ruta.length === 1 ? 'punto registrado' : 'puntos registrados'}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Finalizar actividad"
          accessibilityRole="button"
          onPress={finalizarSeguimiento}
          style={estilos.botonFinalizar}
        >
          <View style={estilos.cuadradoDetener} />
          <Text style={estilos.textoFinalizar}>Finalizar</Text>
        </Pressable>
      </View>

      <VentanaSimulacion
        alCerrar={() => setVentanaSimulacionVisible(false)}
        alSimular={simularRecorrido}
        tipoActividad={tipoActividad}
        visible={ventanaSimulacionVisible}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    backgroundColor: '#DCE5DC',
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  encabezadoMapa: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 18,
    position: 'absolute',
    right: 18,
  },
  tipoActividad: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    boxShadow: '0 8px 20px rgba(23, 63, 59, 0.18)',
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  puntoActivo: {
    backgroundColor: '#8BBF50',
    borderRadius: 5,
    height: 10,
    marginRight: 10,
    width: 10,
  },
  sobretituloMapa: {
    color: '#74827C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  tituloMapa: {
    color: '#173F3B',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 1,
  },
  precision: {
    backgroundColor: '#173F3B',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  textoPrecision: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  contenedorSimulacion: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  botonSimulacion: {
    backgroundColor: '#FFFFFF',
    borderColor: '#173F3B',
    borderRadius: 17,
    borderWidth: 1,
    boxShadow: '0 6px 16px rgba(23, 63, 59, 0.16)',
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  botonSimulacionActivo: {
    backgroundColor: '#E9F478',
    borderColor: '#E9F478',
  },
  textoBotonSimulacion: {
    color: '#173F3B',
    fontSize: 10,
    fontWeight: '900',
  },
  panelInferior: {
    alignItems: 'center',
    backgroundColor: '#F7F8F3',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 17,
    position: 'absolute',
    right: 0,
  },
  etiquetaRuta: {
    color: '#74827C',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  puntosRuta: {
    color: '#173F3B',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  botonFinalizar: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  cuadradoDetener: {
    backgroundColor: '#E9F478',
    borderRadius: 2,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  textoFinalizar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  estadoPantalla: {
    alignItems: 'center',
    backgroundColor: '#173F3B',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  marca: {
    alignItems: 'center',
    backgroundColor: '#E9F478',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginBottom: 32,
    transform: [{ rotate: '-5deg' }],
    width: 54,
  },
  letraMarca: {
    color: '#173F3B',
    fontSize: 27,
    fontWeight: '900',
  },
  iconoAviso: {
    alignItems: 'center',
    borderColor: '#E9F478',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  textoIconoAviso: {
    color: '#E9F478',
    fontSize: 24,
    fontWeight: '900',
  },
  tituloEstado: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 22,
    textAlign: 'center',
  },
  textoEstado: {
    color: '#B5C7C0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 300,
    textAlign: 'center',
  },
  botonReintentar: {
    backgroundColor: '#E9F478',
    borderRadius: 20,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  textoBotonReintentar: {
    color: '#173F3B',
    fontSize: 13,
    fontWeight: '900',
  },
  botonVolver: {
    marginTop: 24,
    padding: 10,
  },
  textoBotonVolver: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
