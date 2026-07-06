export default async function handler(request, response) {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const token = process.env.APPS_SCRIPT_TOKEN;

    if (!appsScriptUrl || !token) {
      return response.status(500).json({
        ok: false,
        error: 'Faltan variables de entorno APPS_SCRIPT_URL o APPS_SCRIPT_TOKEN.'
      });
    }

    const month = request.query.month || getCurrentMonth();

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return response.status(400).json({
        ok: false,
        error: 'Formato de mes inválido. Usa YYYY-MM, por ejemplo 2026-07.'
      });
    }

    const url = new URL(appsScriptUrl);
    url.searchParams.set('route', 'dashboard');
    url.searchParams.set('month', month);
    url.searchParams.set('token', token);

    const googleResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    const text = await googleResponse.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return response.status(502).json({
        ok: false,
        error: 'La respuesta de Google Apps Script no es JSON válido.',
        raw: text.slice(0, 800)
      });
    }

    if (!googleResponse.ok || data.ok === false) {
      return response.status(502).json({
        ok: false,
        error: 'Google Apps Script respondió con error.',
        details: data
      });
    }

    response.setHeader('Cache-Control', 'no-store, max-age=0');
    return response.status(200).json(data);
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error.message
    });
  }
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
