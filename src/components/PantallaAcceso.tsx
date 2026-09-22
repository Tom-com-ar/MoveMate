import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../servicios/supabase';

type ModoAcceso = 'ingresar' | 'registrar';

export function PantallaAcceso() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modo, setModo] = useState<ModoAcceso>('ingresar');

  const enviarFormulario = async () => {
    const correoLimpio = correo.trim().toLowerCase();
    if (!correoLimpio || clave.length < 6 || !supabase) {
      setError('Ingresá un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    setError('');
    setMensaje('');

    try {
      if (modo === 'registrar') {
        const { data, error: errorRegistro } = await supabase.auth.signUp({
          email: correoLimpio,
          password: clave,
        });

        if (errorRegistro) {
          throw errorRegistro;
        }

        if (!data.session) {
          setMensaje('Revisá tu correo y confirmá la cuenta para poder ingresar.');
        }
      } else {
        const { error: errorIngreso } = await supabase.auth.signInWithPassword({
          email: correoLimpio,
          password: clave,
        });

        if (errorIngreso) {
          throw errorIngreso;
        }
      }
    } catch (motivo) {
      setError(
        motivo instanceof Error
          ? motivo.message
          : 'No pudimos completar el acceso. Intentá nuevamente.',
      );
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = (nuevoModo: ModoAcceso) => {
    setModo(nuevoModo);
    setError('');
    setMensaje('');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={estilos.pantalla}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.ajusteTeclado}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentContainerStyle={estilos.contenido}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.marca}>
            <Text style={estilos.letraMarca}>M</Text>
          </View>
          <Text style={estilos.sobretitulo}>MOVEMATE CLOUD</Text>
          <Text style={estilos.titulo}>Tus recorridos,{`\n`}siempre con vos.</Text>
          <Text style={estilos.descripcion}>
            Iniciá sesión para guardar tus actividades y recuperarlas en cualquier
            dispositivo.
          </Text>

          <View style={estilos.formulario}>
            <View style={estilos.selectorModo}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: modo === 'ingresar' }}
                onPress={() => cambiarModo('ingresar')}
                style={[
                  estilos.opcionModo,
                  modo === 'ingresar' && estilos.opcionModoActiva,
                ]}
              >
                <Text
                  style={[
                    estilos.textoModo,
                    modo === 'ingresar' && estilos.textoModoActivo,
                  ]}
                >
                  Ingresar
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: modo === 'registrar' }}
                onPress={() => cambiarModo('registrar')}
                style={[
                  estilos.opcionModo,
                  modo === 'registrar' && estilos.opcionModoActiva,
                ]}
              >
                <Text
                  style={[
                    estilos.textoModo,
                    modo === 'registrar' && estilos.textoModoActivo,
                  ]}
                >
                  Crear cuenta
                </Text>
              </Pressable>
            </View>

            <Text style={estilos.etiqueta}>CORREO</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setCorreo}
              placeholder="tu@correo.com"
              placeholderTextColor="#91A09A"
              style={estilos.campo}
              value={correo}
            />

            <Text style={estilos.etiqueta}>CONTRASEÑA</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete={modo === 'registrar' ? 'new-password' : 'current-password'}
              onChangeText={setClave}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#91A09A"
              secureTextEntry
              style={estilos.campo}
              value={clave}
            />

            {!!error && <Text style={estilos.error}>{error}</Text>}
            {!!mensaje && <Text style={estilos.mensaje}>{mensaje}</Text>}

            <Pressable
              accessibilityRole="button"
              disabled={cargando}
              onPress={() => void enviarFormulario()}
              style={({ pressed }) => [
                estilos.boton,
                pressed && estilos.botonPresionado,
                cargando && estilos.botonDeshabilitado,
              ]}
            >
              {cargando ? (
                <ActivityIndicator color="#173F3B" />
              ) : (
                <Text style={estilos.textoBoton}>
                  {modo === 'ingresar' ? 'Entrar a MoveMate' : 'Crear mi cuenta'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    backgroundColor: '#173F3B',
    flex: 1,
  },
  ajusteTeclado: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  marca: {
    alignItems: 'center',
    backgroundColor: '#E9F478',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
    width: 48,
  },
  letraMarca: {
    color: '#173F3B',
    fontSize: 24,
    fontWeight: '900',
  },
  sobretitulo: {
    color: '#B7CBC4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginTop: 24,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 37,
    marginTop: 8,
  },
  descripcion: {
    color: '#B7CBC4',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 340,
  },
  formulario: {
    backgroundColor: '#F7F8F3',
    borderRadius: 27,
    marginTop: 28,
    padding: 18,
  },
  selectorModo: {
    backgroundColor: '#E5EADD',
    borderRadius: 17,
    flexDirection: 'row',
    marginBottom: 18,
    padding: 3,
  },
  opcionModo: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 9,
  },
  opcionModoActiva: {
    backgroundColor: '#FFFFFF',
  },
  textoModo: {
    color: '#718079',
    fontSize: 11,
    fontWeight: '800',
  },
  textoModoActivo: {
    color: '#173F3B',
  },
  etiqueta: {
    color: '#687A73',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 7,
    marginLeft: 3,
    marginTop: 4,
  },
  campo: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE4DA',
    borderRadius: 16,
    borderWidth: 1,
    color: '#173F3B',
    fontSize: 14,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  error: {
    color: '#B9433D',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  mensaje: {
    color: '#426B48',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  boton: {
    alignItems: 'center',
    backgroundColor: '#E9F478',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginTop: 2,
  },
  botonPresionado: {
    backgroundColor: '#D9E667',
  },
  botonDeshabilitado: {
    opacity: 0.65,
  },
  textoBoton: {
    color: '#173F3B',
    fontSize: 14,
    fontWeight: '900',
  },
});
