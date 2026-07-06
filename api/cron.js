export default async function handler(request, response) {
  try {
    const userAgent = request.headers['user-agent'] || '';

    if (!userAgent.includes('vercel-cron')) {
      return response.status(401).json({
        ok: false,
        error: 'Acceso no autorizado.'
      });
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const token = process.env.APPS_SCRIPT_TOKEN;

    if (!appsScriptUrl || !token) {
      return response.status(500).json({
        ok: false,
        error: 'Faltan variables APPS_SCRIPT_URL o APPS_SCRIPT_TOKEN.'
      });
    }

    const month = getCurrentMonth();
    const url = new URL(appsScriptUrl);

    url.searchParams.set('route', 'dashboard');
    url.searchParams.set('month', month);
    url.searchParams.set('token', token);

    const googleResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok || data.ok === false) {
      return response.status(502).json({
        ok: false,
        error: 'Apps Script respondió con error.',
        details: data
      });
    }

    return response.status(200).json({
      ok: true,
      message: 'Dashboard actualizado correctamente.',
      month,
      generatedAt: data.generatedAt,
      kpis: data.kpis,
      quality: data.quality
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error.message
    });
  }
}

function getCurrentMonth() {
  const now = new Date();

  const colombiaDate = new Date(
    now.toLocaleString('en-US', {
      timeZone: 'America/Bogota'
    })
  );

  const year = colombiaDate.getFullYear();
  const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}