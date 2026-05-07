import Icon from './Icon';

interface TopbarProps {
  title: string;
  breadcrumb?: React.ReactNode;
  pendingCount?: number;
  hideCta?: boolean;
}

export default function Topbar({ title, breadcrumb, pendingCount = 0, hideCta = false }: TopbarProps) {
  return (
    <header className="ds-topbar">
      <div className="ds-tb-left">
        <h1 className="ds-tb-title">{title}</h1>
        {breadcrumb && <span className="ds-tb-bread">{breadcrumb}</span>}
      </div>
      <div className="ds-tb-right">
        <span className="ds-tb-net">
          <span className="dot" />MAINNET·BETA
        </span>
        <button className="ds-tb-bell" aria-label="notifications">
          <Icon name="bell" size={16} />
          {pendingCount > 0 && <span className="dot" />}
        </button>
        {!hideCta && (
          <button className="ds-tb-cta">
            <Icon name="plus" size={14} />
            <span>NEW WALLET</span>
          </button>
        )}
      </div>
    </header>
  );
}
