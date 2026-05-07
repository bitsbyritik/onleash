'use client';

import { useState } from 'react';
import Topbar from '@/components/dashboard/Topbar';
import { TRANSFERS, type TransferStatus } from '../data';

type FilterKey = TransferStatus | 'all';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'success',  label: 'Success' },
  { key: 'pending',  label: 'Pending' },
  { key: 'blocked',  label: 'Blocked' },
  { key: 'rejected', label: 'Rejected' },
];

export default function TransfersPage() {
  const [filter, setFilter] = useState<FilterKey>('blocked');

  const counts: Record<FilterKey, number> = {
    all:      TRANSFERS.length,
    success:  TRANSFERS.filter(t => t.status === 'success').length,
    pending:  TRANSFERS.filter(t => t.status === 'pending').length,
    blocked:  TRANSFERS.filter(t => t.status === 'blocked').length,
    rejected: TRANSFERS.filter(t => t.status === 'rejected').length,
  };

  const shown = filter === 'all' ? TRANSFERS : TRANSFERS.filter(t => t.status === filter);

  return (
    <>
      <Topbar title="Transfers" pendingCount={2} />
      <div className="ds-content">
        <div className="ds-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ds-filt${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="ct">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        <div className="ds-panel">
          <div className="ds-panel-h">
            <b>{shown.length} transfers</b>
            <span>filter · {filter.toUpperCase()}</span>
          </div>
          <table className="ds-tt">
            <thead>
              <tr>
                <th>Time</th><th>Wallet</th><th>To Address</th>
                <th>Reason</th><th className="right">Amount</th><th>Token</th>
                <th className="right">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(t => (
                <tr key={t.id}>
                  <td className="time">{t.time}</td>
                  <td className="wal">{t.wallet}</td>
                  <td className="addr">{t.to.lbl} · {t.to.to.slice(0, 16)}…</td>
                  <td className={`reason${t.status === 'blocked' ? ' neg' : ''}`}>{t.reason || '—'}</td>
                  <td className={`am${t.status === 'blocked' ? ' neg' : ''}`}>{t.amount.toFixed(2)}</td>
                  <td style={{ color: 'var(--ink-dim)', fontSize: 11 }}>{t.token}</td>
                  <td className="right"><span className={`ds-bdg ${t.status}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
