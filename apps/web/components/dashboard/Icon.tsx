interface IconProps {
  name: string;
  size?: number;
}

export default function Icon({ name, size = 16 }: IconProps) {
  const s = size;
  const sw = 1.6;
  switch (name) {
    case 'overview': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="square" strokeLinejoin="miter">
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    );
    case 'wallets': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <rect x="2.5" y="6" width="19" height="14"/><path d="M2.5 10 H21.5"/><circle cx="17" cy="15" r="1.2" fill="currentColor"/>
      </svg>
    );
    case 'transfers': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M3 8 H17 L13 4 M21 16 H7 L11 20"/>
      </svg>
    );
    case 'approvals': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M12 2 L21 6 V12 C21 17 17 20 12 22 C7 20 3 17 3 12 V6 Z"/>
        <path d="M8 12 l3 3 l5 -6"/>
      </svg>
    );
    case 'settings': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9"/>
      </svg>
    );
    case 'bell': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M6 9 a6 6 0 0 1 12 0 v5 l2 3 H4 l2 -3 z"/><path d="M10 20 a2 2 0 0 0 4 0"/>
      </svg>
    );
    case 'plus': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw + 0.4}>
        <path d="M12 5 V19 M5 12 H19"/>
      </svg>
    );
    case 'menu': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
      </svg>
    );
    case 'arrow': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M5 12 H19 M13 6 L19 12 L13 18"/>
      </svg>
    );
    case 'warn': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M12 3 L22 20 H2 Z"/><path d="M12 10 V14"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>
      </svg>
    );
    case 'eye': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M2 12 C5 6 9 4 12 4 S19 6 22 12 C19 18 15 20 12 20 S5 18 2 12 Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
    case 'eye-off': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    );
    default: return null;
  }
}
