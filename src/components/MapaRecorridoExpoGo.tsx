import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { LatLng } from 'react-native-maps';
import { WebView } from 'react-native-webview';

type PropiedadesMapaRecorridoExpoGo = {
  posicionActual: LatLng;
  ruta: LatLng[];
};

export type ReferenciaMapaRecorridoExpoGo = {
  acercar: () => void;
  alejar: () => void;
  centrar: () => void;
};

function convertirRutaParaMapa(ruta: LatLng[]) {
  return ruta.map((punto) => [punto.latitude, punto.longitude]);
}

function crearContenidoMapa(posicionInicial: LatLng, rutaInicial: LatLng[]) {
  const puntosIniciales = JSON.stringify(convertirRutaParaMapa(rutaInicial));

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #mapa { height: 100%; margin: 0; width: 100%; }
          body { background: #e7ece5; }
          .leaflet-control-attribution { font-family: sans-serif; font-size: 10px; }
        </style>
      </head>
      <body>
        <div id="mapa"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const posicionInicial = [${posicionInicial.latitude}, ${posicionInicial.longitude}];
          const mapa = L.map('mapa', { zoomControl: false }).setView(posicionInicial, 16);

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapa);

          L.circleMarker(posicionInicial, {
            color: '#ffffff',
            fillColor: '#173f3b',
            fillOpacity: 1,
            radius: 7,
            weight: 3,
          }).addTo(mapa).bindTooltip('Inicio');

          const marcadorActual = L.circleMarker(posicionInicial, {
            color: '#173f3b',
            fillColor: '#e9f478',
            fillOpacity: 1,
            radius: 9,
            weight: 3,
          }).addTo(mapa);

          const recorrido = L.polyline(${puntosIniciales}, {
            color: '#173f3b',
            lineCap: 'round',
            lineJoin: 'round',
            weight: 6,
          }).addTo(mapa);

          window.actualizarRecorrido = function(puntos) {
            if (!Array.isArray(puntos) || puntos.length === 0) return;
            const ultimoPunto = puntos[puntos.length - 1];
            recorrido.setLatLngs(puntos);
            marcadorActual.setLatLng(ultimoPunto);
            mapa.panTo(ultimoPunto, { animate: true, duration: 0.5 });
          };

          window.controlarMapa = function(accion, posicion) {
            if (accion === 'acercar') {
              mapa.setZoom(Math.min(mapa.getZoom() + 1, 19));
            }
            if (accion === 'alejar') {
              mapa.setZoom(Math.max(mapa.getZoom() - 1, 3));
            }
            if (accion === 'centrar') {
              mapa.setView(posicion, Math.max(mapa.getZoom(), 16), {
                animate: true,
                duration: 0.35,
              });
            }
          };
        </script>
      </body>
    </html>
  `;
}

export const MapaRecorridoExpoGo = forwardRef<
  ReferenciaMapaRecorridoExpoGo,
  PropiedadesMapaRecorridoExpoGo
>(function MapaRecorridoExpoGo({ posicionActual, ruta }, referenciaExterna) {
  const referenciaMapa = useRef<WebView>(null);
  const [contenidoMapa] = useState(() =>
    crearContenidoMapa(posicionActual, ruta),
  );

  const actualizarMapa = useCallback(() => {
    const puntos = JSON.stringify(convertirRutaParaMapa(ruta));
    referenciaMapa.current?.injectJavaScript(`
      if (window.actualizarRecorrido) {
        window.actualizarRecorrido(${puntos});
      }
      true;
    `);
  }, [ruta]);

  const controlarMapa = useCallback(
    (accion: 'acercar' | 'alejar' | 'centrar') => {
      const posicion = JSON.stringify([
        posicionActual.latitude,
        posicionActual.longitude,
      ]);
      referenciaMapa.current?.injectJavaScript(`
        if (window.controlarMapa) {
          window.controlarMapa('${accion}', ${posicion});
        }
        true;
      `);
    },
    [posicionActual],
  );

  useImperativeHandle(
    referenciaExterna,
    () => ({
      acercar: () => controlarMapa('acercar'),
      alejar: () => controlarMapa('alejar'),
      centrar: () => controlarMapa('centrar'),
    }),
    [controlarMapa],
  );

  useEffect(() => {
    actualizarMapa();
  }, [actualizarMapa]);

  return (
    <WebView
      onLoadEnd={actualizarMapa}
      originWhitelist={['*']}
      ref={referenciaMapa}
      source={{ html: contenidoMapa, baseUrl: 'https://movemate.local' }}
    />
  );
});
