export function formatNumber(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(number);
}

export function formatDecimal(value, digits = 1) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(number);
}

export function formatCurrency(value) {
  const number = Number(value) || 0;

  if (Math.abs(number) >= 1000000) {
    return `US$ ${formatDecimal(number / 1000000, 1)}MM`;
  }

  if (Math.abs(number) >= 1000) {
    return `US$ ${formatDecimal(number / 1000, 1)}K`;
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(number);
}

export function formatPercent(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(number);
}

export function getStatusClass(status) {
  const value = String(status || '').toLowerCase();

  if (value.includes('cumplido')) return 'status-good';
  if (value.includes('avance')) return 'status-progress';
  if (value.includes('riesgo')) return 'status-warning';
  return 'status-critical';
}

export function getMonthLabel(monthKey) {
  if (!monthKey || !monthKey.includes('-')) return 'Mes no definido';

  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}
