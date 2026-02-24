import React, { type JSX } from 'react';
import { listEvents, type EventDto } from '../lib/events';
import { theme } from '../theme';

export default function Explore(): JSX.Element {
  const [rows, setRows] = React.useState<EventDto[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await listEvents(50);
        setRows(r.data || []);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ minHeight:'100vh', background: theme.colors.bg, padding:'16px 18px' }}>
      <h2 style={{ margin:'6px 0 12px' }}>Events</h2>
      {loading ? <div>Loading…</div> : (
        rows.length ? rows.map(e => (
          <div key={e.id} style={{ background:'#fff', borderRadius:14, padding:12, marginBottom:10, boxShadow: theme.shadow.card }}>
            <div style={{ fontWeight:800 }}>{e.title}</div>
            <div style={{ color: theme.colors.subtext, marginTop:4 }}>{new Date(e.startAt).toLocaleString()}</div>
            {e.location && <div style={{ color: theme.colors.subtext }}>{e.location}</div>}
            <div style={{ marginTop:6, color: e.status === 'cancelled' ? theme.colors.danger : theme.colors.success, fontWeight:700 }}>
              {e.status}
            </div>
          </div>
        )) : <div style={{ color: theme.colors.subtext }}>No events yet.</div>
      )}
    </div>
  );
}
