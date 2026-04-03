interface SSOPayload {
  email: string;
  name: string;
  user_id?: string;
  timestamp: number;
  signature: string;
}

interface SSOUserData {
  email: string;
  name: string;
  user_id?: string;
}

export async function verifySSOToken(token: string): Promise<SSOUserData | null> {
  try {
    const decoded = atob(token);
    const params = new URLSearchParams(decoded);

    const email = params.get('email');
    const name = params.get('name');
    const user_id = params.get('user_id');
    const timestamp = params.get('timestamp');
    const signature = params.get('signature');

    if (!email || !name || !timestamp || !signature) {
      console.error('SSO: Missing required parameters');
      return null;
    }

    const tokenTimestamp = parseInt(timestamp);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - tokenTimestamp > fiveMinutes) {
      console.error('SSO: Token expired');
      return null;
    }

    const ssoSecret = import.meta.env.VITE_SSO_SECRET;
    if (!ssoSecret) {
      console.error('SSO: SSO_SECRET not configured');
      return null;
    }

    const payload = `${email}|${name}|${user_id || ''}|${timestamp}`;
    const expectedSignature = await generateSignature(payload, ssoSecret);

    if (signature !== expectedSignature) {
      console.error('SSO: Invalid signature');
      return null;
    }

    return {
      email,
      name,
      user_id: user_id || undefined
    };
  } catch (error) {
    console.error('SSO: Token verification failed', error);
    return null;
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = encoder.encode(secret);

  const keyData = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', keyData, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function buildSSOToken(userData: SSOUserData, secret: string): Promise<string> {
  try {
    const timestamp = Date.now().toString();
    const payload = `${userData.email}|${userData.name}|${userData.user_id || ''}|${timestamp}`;

    const signature = await generateSignature(payload, secret);

    const params = new URLSearchParams({
      email: userData.email,
      name: userData.name,
      user_id: userData.user_id || '',
      timestamp,
      signature
    });

    return btoa(params.toString());
  } catch (error) {
    console.error('SSO: Failed to build token', error);
    throw new Error('Failed to generate SSO token');
  }
}
