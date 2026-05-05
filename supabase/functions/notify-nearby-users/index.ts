import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const NOTIFY_RADIUS_KM = 2;

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record || record.status !== 'available') {
      return new Response('No action', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar usuarios con notificaciones activas, GPS activo y token valido, dentro del radio
    const { data: users, error } = await supabase.rpc('get_users_to_notify', {
      p_lat: record.lat,
      p_lng: record.lng,
      p_radius_km: NOTIFY_RADIUS_KM,
      p_exclude_user_id: record.reporter_id,
    });

    if (error) throw error;
    if (!users || users.length === 0) return new Response('No users to notify', { status: 200 });

    const spotTypeLabels: Record<string, string> = {
      calle: 'en la calle',
      playa: 'en playa de estacionamiento',
      cochera: 'en cochera',
      zona_azul: 'en zona azul',
      otro: '',
    };

    const messages = users.map((u: { push_token: string }) => ({
      to: u.push_token,
      sound: 'default',
      title: 'Lugar disponible cerca tuyo',
      body: `Alguien libero un lugar ${spotTypeLabels[record.spot_type] ?? ''}. Apurate!`,
      data: { spot_id: record.id },
    }));

    // Enviar en batches de 100 (limite de Expo)
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
    }

    return new Response(JSON.stringify({ sent: messages.length }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
