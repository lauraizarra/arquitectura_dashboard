# Dashboard Arquitectura 2026

Dashboard para medir Technical Validation, riesgo técnico y oportunidades asociadas a tickets.

## Flujo

HubSpot → Google Sheets → Apps Script Web App → Vercel

## Variables necesarias

Copia `.env.example` y crea un archivo nuevo llamado `.env.local` en la raíz del proyecto:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXXXXXX/exec
APPS_SCRIPT_TOKEN=TU_TOKEN_PRIVADO
```

## Instalación

```bash
npm install
```

## Prueba local completa con API

Usa este comando para levantar el frontend y las funciones `/api` como lo hará Vercel:

```bash
npm run dev:full
```

Abre la URL que indique la terminal, normalmente:

```text
http://localhost:3000
```

## Prueba rápida de salud

Con `npm run dev:full` activo, abre:

```text
http://localhost:3000/api/health
```

Debe responder con JSON desde Google Apps Script.

## Build

```bash
npm run build
```

## Deploy en Vercel

Configuración recomendada:

- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

Variables de entorno en Vercel:

- APPS_SCRIPT_URL
- APPS_SCRIPT_TOKEN

No subas `.env.local` a GitHub.
