type MarkType = 'yes' | 'no' | 'partial'

const FEATURES: { f: string; us: MarkType; cloaked: MarkType; turnkey: MarkType; privy: MarkType }[] = [
  { f: 'Trustless Anchor program',           us: 'yes', cloaked: 'yes',     turnkey: 'no',      privy: 'no'      },
  { f: 'Daily spend cap',                    us: 'yes', cloaked: 'yes',     turnkey: 'partial', privy: 'no'      },
  { f: 'Per‑vendor caps',                    us: 'yes', cloaked: 'no',      turnkey: 'no',      privy: 'no'      },
  { f: 'Address blocklist / allowlist',      us: 'yes', cloaked: 'no',      turnkey: 'partial', privy: 'no'      },
  { f: 'Telegram HITL approval',             us: 'yes', cloaked: 'no',      turnkey: 'no',      privy: 'no'      },
  { f: 'Multi‑agent hierarchy onchain',      us: 'yes', cloaked: 'no',      turnkey: 'no',      privy: 'no'      },
  { f: 'Open‑source SDK',                    us: 'yes', cloaked: 'yes',     turnkey: 'no',      privy: 'partial' },
  { f: 'Solana Agent Kit · LangChain · CrewAI', us: 'yes', cloaked: 'partial', turnkey: 'no',  privy: 'no'      },
]

function Mark({ val, isUs }: { val: MarkType; isUs: boolean }) {
  return (
    <div className={`comp-cell${isUs ? ' us' : ''}`}>
      {val === 'yes'     && <span className="comp-mark yes">●</span>}
      {val === 'no'      && <span className="comp-mark no">○</span>}
      {val === 'partial' && <span className="comp-mark partial">PARTIAL</span>}
    </div>
  )
}

export default function ComparisonSection() {
  return (
    <section className="section" id="compare">
      <div className="container">
        <div>
          <div className="eyebrow">The receipt</div>
          <h2 className="section-title">
            Nobody else ships<br />
            all four. <span style={{ color: 'var(--magenta)' }}>Receipts:</span>
          </h2>
          <p className="section-sub">
            Same category. Different scoreboard. We&apos;d rather you compare than take our word.
          </p>
        </div>

        <div className="comp-table">
          <div className="comp-row head">
            <div className="comp-cell feature">Feature</div>
            <div className="comp-cell us">OnLeash</div>
            <div className="comp-cell">CloakedAgent</div>
            <div className="comp-cell">Turnkey</div>
            <div className="comp-cell">Privy</div>
          </div>
          {FEATURES.map((row, i) => (
            <div className="comp-row" key={i}>
              <div className="comp-cell feature">{row.f}</div>
              <Mark val={row.us}      isUs={true} />
              <Mark val={row.cloaked} isUs={false} />
              <Mark val={row.turnkey} isUs={false} />
              <Mark val={row.privy}   isUs={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
