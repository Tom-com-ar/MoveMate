import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '../servicios/supabase';

export function useSesionSupabase() {
  const [cargandoSesion, setCargandoSesion] = useState(supabaseConfigurado);
  const [sesion, setSesion] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let pantallaActiva = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (pantallaActiva) {
        setSesion(data.session);
        setCargandoSesion(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      if (pantallaActiva) {
        setSesion(nuevaSesion);
        setCargandoSesion(false);
      }
    });

    return () => {
      pantallaActiva = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { cargandoSesion, sesion };
}
