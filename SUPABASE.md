# Configurar Supabase para el M7

Supabase va a guardar las actividades en Internet y asociarlas al usuario que
inició sesión. La aplicación ya tiene preparada la pantalla de acceso, el
guardado al finalizar una actividad y la descarga del historial.

## 1. Crear el proyecto

1. Entrá a https://supabase.com/dashboard y creá una cuenta si todavía no tenés.
2. Elegí **New project**.
3. Escribí un nombre para el proyecto, una contraseña para la base de datos y
   elegí una región cercana.
4. Esperá a que Supabase termine de preparar el proyecto.

## 2. Crear la tabla de actividades

1. Dentro del proyecto, abrí **SQL Editor**.
2. Elegí **New query**.
3. Copiá todo el contenido de `supabase/migrations/001_actividades.sql`.
4. Pegalo en el editor y presioná **Run**.

Ese archivo crea la tabla `actividades` y activa las reglas de seguridad. Las
reglas hacen que un usuario solamente pueda leer, crear, modificar o borrar sus
propias actividades.

## 3. Conectar la aplicación

1. En Supabase, abrí **Connect** o **Project Settings > API**.
2. Copiá la **Project URL** y la **Publishable key**.
3. En la carpeta principal de MoveMate, copiá `.env.example` y llamá a la copia
   `.env`.
4. Reemplazá los valores de ejemplo:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

La Publishable key puede estar en una aplicación móvil. No uses ni compartas la
clave `service_role`, porque esa clave evita las reglas de seguridad.

## 4. Probar el M7

1. Cerrá el servidor de Expo si estaba abierto.
2. Volvé a iniciar la aplicación con `npm start`.
3. Registrá un usuario con correo y contraseña.
4. Si Supabase pide confirmar el correo, abrí el mensaje recibido y confirmalo.
5. Iniciá sesión, registrá una actividad corta y finalizala.
6. Abrí el historial: la actividad debería aparecer allí.
7. Cerrá y volvé a abrir la aplicación para comprobar que la sesión y el
   historial se recuperan desde Supabase.

Si todavía no existe el archivo `.env`, MoveMate sigue funcionando en modo
local para no bloquear el resto de la aplicación.
