import { useEffect, useMemo, useState } from 'react';
import {
  formatCurrency,
  formatDecimal,
  formatNumber,
  formatPercent,
  getMonthLabel,
  getStatusClass
} from './utils';

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function App() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setStatus('loading');
      setError('');

      const response = await fetch(`/api/dashboard?month=${month}&t=${Date.now()}`);
      const result = await response.json();

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || 'No se pudo cargar el dashboard.');
      }

      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [month]);

  const kpis = data?.kpis || {};
  const byRegion = data?.byRegion || [];
  const byArchitect = data?.byArchitect || [];
  const alerts = data?.alerts || [];
  const quality = data?.quality || {};

  const sortedArchitects = useMemo(() => {
    return [...byArchitect].sort((a, b) => {
      if ((b.tvOverdue || 0) !== (a.tvOverdue || 0)) {
        return (b.tvOverdue || 0) - (a.tvOverdue || 0);
      }
      return (b.pipelineRisk || 0) - (a.pipelineRisk || 0);
    });
  }, [byArchitect]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Arquitectura · 2026</p>
          <h1>Dashboard de Gestión Técnica y Oportunidades</h1>
          <p className="subtitle">
            Seguimiento ejecutivo de Technical Validation, riesgo técnico y oportunidades asociadas a tickets.
          </p>
        </div>

        <div className="toolbar">
          <label>
            Mes de análisis
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>

          <button type="button" onClick={loadDashboard}>
            Actualizar
          </button>
        </div>
      </header>

      {status === 'loading' && (
        <section className="state-card">
          Cargando data desde Google Sheets…
        </section>
      )}

      {status === 'error' && (
        <section className="state-card error">
          <strong>No se pudo cargar el dashboard.</strong>
          <span>{error}</span>
        </section>
      )}

      {status === 'success' && data && (
        <>
          <section className="summary-strip">
            <div>
              <span>Mes seleccionado</span>
              <strong>{getMonthLabel(data.selectedMonth)}</strong>
            </div>

            <div>
              <span>Última actualización</span>
              <strong>{new Date(data.generatedAt).toLocaleString('es-CO')}</strong>
            </div>

            <div>
              <span>Arquitectos en modelo</span>
              <strong>{quality.architectsUsedInModel || byArchitect.length}</strong>
            </div>

            <div>
              <span>Filas TV / Tickets</span>
              <strong>{quality.tvRows || 0} / {quality.ticketRows || 0}</strong>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Bloque 1</p>
                <h2>Technical Validation</h2>
              </div>

              <p>
                Mide permanencia en etapa, cumplimiento SLA, vencimientos y pipeline expuesto.
              </p>
            </div>

            <div className="kpi-grid">
              <KpiCard title="Oportunidades en TV" value={formatNumber(kpis.tvOpen)} note="Activas en Technical Validation" />
              <KpiCard title="Promedio días TV" value={formatDecimal(kpis.avgDaysTV, 1)} note="Promedio general" />
              <KpiCard title="En alerta" value={formatNumber(kpis.tvAlert)} note="Cerca de vencimiento" tone="warning" />
              <KpiCard title="Vencidas" value={formatNumber(kpis.tvOverdue)} note="Fuera de SLA" tone="danger" />
              <KpiCard title="Sin arquitecto" value={formatNumber(kpis.tvWithoutArchitect)} note="Asignación pendiente" tone="danger" />
              <KpiCard title="Pipeline en TV" value={formatCurrency(kpis.pipelineTV)} note="Net Revenue en etapa" />
              <KpiCard title="Pipeline en riesgo" value={formatCurrency(kpis.pipelineRisk)} note="Exposición por SLA/riesgo" tone="warning" />
              <KpiCard title="SLA Cloud" value={formatPercent(kpis.slaCloudPct)} note="Dentro de SLA Cloud Architect" />
              <KpiCard title="SLA Arq Lead" value={formatPercent(kpis.slaLeadPct)} note="Dentro de SLA Arq Lead" />
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Bloque 2</p>
                <h2>Tickets con oportunidades asociadas</h2>
              </div>

              <p>
                Mide oportunidades únicas asociadas a tickets válidos. El ticket no suma solo; suma el deal asociado.
              </p>
            </div>

            <div className="kpi-grid ticket-grid">
              <KpiCard title="Tickets creados" value={formatNumber(kpis.ticketsCreated)} note="Mes seleccionado" />
              <KpiCard title="Tickets con deal" value={formatNumber(kpis.ticketsWithDeal)} note="Tienen oportunidad asociada" />
              <KpiCard title="Opps únicas válidas" value={formatNumber(kpis.uniqueValidOpps)} note="Deduplicadas por deal + arquitecto + mes" />
              <KpiCard title="Target mensual" value={formatNumber(kpis.targetMonthly)} note="Meta prorrateada" />
              <KpiCard title="Cumplimiento" value={formatPercent(kpis.ticketCompliancePct)} note="Opps válidas / target" tone={Number(kpis.ticketCompliancePct || 0) >= 1 ? 'good' : 'warning'} />
              <KpiCard title="Pipeline válido" value={formatCurrency(kpis.validPipeline)} note="Net Revenue asociado" />
            </div>

            {Number(kpis.ticketsCreated || 0) === 0 && (
              <div className="empty-note">
                La base de tickets todavía no tiene data para {getMonthLabel(data.selectedMonth)}. El bloque queda listo para activarse cuando HubSpot empiece a alimentar la pestaña.
              </div>
            )}
          </section>

          <section className="two-columns">
            <div className="panel">
              <div className="panel-heading">
                <h2>Resumen por región</h2>
                <span>{byRegion.length} regiones</span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Región</th>
                      <th>HC</th>
                      <th>TV</th>
                      <th>Alerta</th>
                      <th>Vencidas</th>
                      <th>SLA Cloud</th>
                      <th>SLA Lead</th>
                      <th>Pipeline riesgo</th>
                      <th>Opps / Meta</th>
                    </tr>
                  </thead>

                  <tbody>
                    {byRegion.map((region) => (
                      <tr key={region.region}>
                        <td><strong>{region.region}</strong></td>
                        <td>{formatNumber(region.hc)}</td>
                        <td>{formatNumber(region.tvOpen)}</td>
                        <td>{formatNumber(region.tvAlert)}</td>
                        <td>{formatNumber(region.tvOverdue)}</td>
                        <td>{formatPercent(region.slaCloudPct)}</td>
                        <td>{formatPercent(region.slaLeadPct)}</td>
                        <td>{formatCurrency(region.pipelineRisk)}</td>
                        <td>{formatNumber(region.uniqueValidOpps)} / {formatNumber(region.targetMonthly)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Alertas operativas</h2>
                <span>{alerts.length} alertas</span>
              </div>

              <div className="alerts-list">
                {alerts.length === 0 && (
                  <div className="empty-note compact">
                    Sin alertas para el mes seleccionado.
                  </div>
                )}

                {alerts.slice(0, 12).map((alert, index) => (
                  <article className={`alert-card ${alert.severity === 'Alta' ? 'high' : 'medium'}`} key={`${alert.title}-${index}`}>
                    <div>
                      <strong>{alert.title}</strong>
                      <span>{alert.type} · {alert.region}</span>
                    </div>
                    <p>{alert.record}</p>
                    <small>{alert.detail}</small>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="panel full">
            <div className="panel-heading">
              <h2>Detalle por arquitecto</h2>
              <span>{sortedArchitects.length} arquitectos</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Arquitecto</th>
                    <th>Región</th>
                    <th>Arq Lead</th>
                    <th>TV abiertas</th>
                    <th>Prom. días</th>
                    <th>Alerta</th>
                    <th>Vencidas</th>
                    <th>Pipeline riesgo</th>
                    <th>SLA Cloud</th>
                    <th>Opps / Meta</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedArchitects.map((architect) => (
                    <tr key={`${architect.architect}-${architect.email}`}>
                      <td>
                        <strong>{architect.architect}</strong>
                        {architect.email && <span className="muted-line">{architect.email}</span>}
                      </td>
                      <td>{architect.region}</td>
                      <td>{architect.lead || 'Validar'}</td>
                      <td>{formatNumber(architect.tvOpen)}</td>
                      <td>{formatDecimal(architect.avgDaysTV, 1)}</td>
                      <td>{formatNumber(architect.tvAlert)}</td>
                      <td>{formatNumber(architect.tvOverdue)}</td>
                      <td>{formatCurrency(architect.pipelineRisk)}</td>
                      <td>{formatPercent(architect.slaCloudPct)}</td>
                      <td>{formatNumber(architect.uniqueValidOpps)} / {formatNumber(architect.targetMonthly)}</td>
                      <td>
                        <span className={`status-pill ${getStatusClass(architect.ticketComplianceStatus)}`}>
                          {architect.ticketComplianceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function KpiCard({ title, value, note, tone = 'default' }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
