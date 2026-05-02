import Badge from "./Badge";
import type { Transfer } from "./data";

export default function TransferTable({ rows }: { rows: Transfer[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>TIME</th>
          <th>TO ADDRESS</th>
          <th>AMOUNT</th>
          <th>STATUS</th>
          <th>REASON</th>
          <th>SIG</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t, i) => (
          <tr key={i}>
            <td className="td-time">{t.time}</td>
            <td className="td-mono">{t.to}</td>
            <td>
              <span className="td-amount">{t.usd}</span>{" "}
              <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>{t.token}</span>
            </td>
            <td><Badge status={t.status} /></td>
            <td style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.02em" }}>
              {t.reason}
            </td>
            <td className="td-mono" style={{ color: t.sig === "—" ? "var(--text-tertiary)" : "var(--blue)" }}>
              {t.sig}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
