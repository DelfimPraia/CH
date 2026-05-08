import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

const AREA_LABELS: Record<string, string> = {
  geoscience: 'Geociência',
  engineering: 'Engenharia',
  data_science: 'Data Science / IA',
  it: 'TI / Software',
  management: 'Gestão / Negócio',
  other: 'Outro',
};

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  job_title: string | null;
  area: string | null;
  linkedin_url: string | null;
  created_at: string;
};

export type CheckInRow = { user_id: string; checked_in_at: string };

const COLORS = {
  navy: '#0b1220',
  navySoft: '#1e293b',
  cyan: '#ea580c',
  cyanDark: '#9a3412',
  white: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  zebra: '#f8fafc',
  panelBg: '#f1f5f9',
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    paddingTop: 0,
    fontSize: 9,
    color: COLORS.text,
    fontFamily: 'Helvetica',
  },
  // Header band (navy with cyan accent line)
  headerBand: {
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    padding: 24,
    marginHorizontal: -32,
    marginBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.cyan,
    borderBottomStyle: 'solid',
  },
  headerEyebrow: {
    fontSize: 8,
    color: COLORS.cyan,
    letterSpacing: 2,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  headerMeta: {
    marginTop: 10,
    fontSize: 9,
    color: '#64748b',
  },

  // Sections
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // KPIs
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.panelBg,
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
    borderLeftStyle: 'solid',
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },
  kpiLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 8,
    color: COLORS.cyanDark,
    marginTop: 1,
  },

  // Distribution
  distrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  distrLabel: {
    width: 110,
    fontSize: 9,
    color: COLORS.text,
  },
  distrBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginRight: 6,
  },
  distrBarInner: {
    height: 8,
    backgroundColor: COLORS.cyan,
    borderRadius: 2,
  },
  distrCount: {
    fontSize: 9,
    color: COLORS.muted,
    width: 60,
    textAlign: 'right',
  },

  // Table
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    padding: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    borderBottomStyle: 'solid',
    fontSize: 8,
  },
  tableRowZebra: {
    backgroundColor: COLORS.zebra,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.muted,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    borderTopStyle: 'solid',
    paddingTop: 6,
  },
});

// Column widths for the participant table (sums to 100 of percentage budget).
const COL = {
  num:      { width: '4%',  align: 'left' as const },
  name:     { width: '22%', align: 'left' as const },
  email:    { width: '24%', align: 'left' as const },
  company:  { width: '16%', align: 'left' as const },
  jobTitle: { width: '14%', align: 'left' as const },
  area:     { width: '12%', align: 'left' as const },
  signup:   { width: '8%',  align: 'right' as const },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function InscritosReport({
  profiles,
  checkIns,
  generatedAt,
}: {
  profiles: ProfileRow[];
  checkIns: CheckInRow[];
  generatedAt: Date;
}) {
  const checkInMap = new Map<string, string>(checkIns.map((c) => [c.user_id, c.checked_in_at]));
  const total = profiles.length;
  const totalCheckedIn = checkInMap.size;
  const checkInRate = total ? Math.round((totalCheckedIn / total) * 100) : 0;

  // distribution by area
  const areaCounts: Record<string, number> = {};
  for (const p of profiles) {
    const k = p.area ?? 'unknown';
    areaCounts[k] = (areaCounts[k] ?? 0) + 1;
  }
  const totalForArea = Object.values(areaCounts).reduce((a, b) => a + b, 0) || 1;
  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

  return (
    <Document
      title="Relatório de Inscritos — AI Oil & Gas 2026"
      author="AI Oil & Gas Conference"
      creator="AI Oil & Gas Conference App"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header band */}
        <View style={styles.headerBand} fixed>
          <Text style={styles.headerEyebrow}>RELATÓRIO DE INSCRITOS</Text>
          <Text style={styles.headerTitle}>AI Oil &amp; Gas Conference 2026</Text>
          <Text style={styles.headerSubtitle}>
            Sábado, 16 de Maio de 2026 · Huawei Angola office park
          </Text>
          <Text style={styles.headerMeta}>
            Gerado em {formatDateTime(generatedAt.toISOString())}
          </Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{total}</Text>
            <Text style={styles.kpiLabel}>Inscritos</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{totalCheckedIn}</Text>
            <Text style={styles.kpiLabel}>Check-ins</Text>
            <Text style={styles.kpiSub}>{checkInRate}% de presença</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{Object.keys(areaCounts).filter((k) => k !== 'unknown').length}</Text>
            <Text style={styles.kpiLabel}>Áreas</Text>
          </View>
        </View>

        {/* Distribution by area */}
        {sortedAreas.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.sectionTitle}>Distribuição por área</Text>
            {sortedAreas.map(([k, n]) => {
              const pct = (n / totalForArea) * 100;
              return (
                <View key={k} style={styles.distrRow}>
                  <Text style={styles.distrLabel}>{AREA_LABELS[k] ?? k}</Text>
                  <View style={styles.distrBarOuter}>
                    <View style={[styles.distrBarInner, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.distrCount}>
                    {n} · {pct.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Participant table */}
        <Text style={styles.sectionTitle}>Lista de participantes</Text>

        <View style={styles.tableHead} fixed>
          <Text style={COL.num}>#</Text>
          <Text style={COL.name}>Nome</Text>
          <Text style={COL.email}>Email</Text>
          <Text style={COL.company}>Empresa</Text>
          <Text style={COL.jobTitle}>Função</Text>
          <Text style={COL.area}>Área</Text>
          <Text style={COL.signup}>Inscrição</Text>
        </View>

        {profiles.map((p, i) => {
          const checkIn = checkInMap.get(p.id);
          return (
            <View
              key={p.id}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowZebra : {}]}
              wrap={false}
            >
              <Text style={COL.num}>{i + 1}</Text>
              <Text style={COL.name}>
                {p.full_name}
                {checkIn ? '  ✓' : ''}
              </Text>
              <Text style={COL.email}>{p.email}</Text>
              <Text style={COL.company}>{p.company ?? '—'}</Text>
              <Text style={COL.jobTitle}>{p.job_title ?? '—'}</Text>
              <Text style={COL.area}>
                {p.area ? AREA_LABELS[p.area] ?? p.area : '—'}
              </Text>
              <Text style={COL.signup}>{formatDate(p.created_at)}</Text>
            </View>
          );
        })}

        {profiles.length === 0 && (
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>
            Sem inscritos no momento.
          </Text>
        )}

        {/* Legend */}
        <Text style={{ fontSize: 7, color: COLORS.muted, marginTop: 10, fontStyle: 'italic' }}>
          ✓ ao lado do nome indica check-in feito.
        </Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>AI Oil &amp; Gas Conference 2026 · Promovido por Copia × Huawei</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

// Suppress font warnings on hot reload
Font.registerHyphenationCallback((word) => [word]);
