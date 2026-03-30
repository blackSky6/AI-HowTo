import type { APIRoute } from 'astro';
import { Webhook } from 'svix';

// Clerk Webhook：用户创建/更新时同步到 Supabase
export const POST: APIRoute = async ({ request }) => {
  const WEBHOOK_SECRET = import.meta.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }

  // 验证 Clerk 签名
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const { type, data } = evt;

  // 只处理用户创建和更新事件
  if (type === 'user.created' || type === 'user.updated') {
    const DATABASE_URL = import.meta.env.DATABASE_URL;
    const { default: postgres } = await import('postgres');
    const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 });

    const email = data.email_addresses?.[0]?.email_address ?? '';
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;
    const avatar_url = data.image_url ?? null;

    await sql`
      INSERT INTO users (id, email, name, avatar_url)
      VALUES (${data.id}, ${email}, ${name}, ${avatar_url})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
    `;

    await sql.end();
  }

  return new Response('OK', { status: 200 });
};
