import { Fragment } from 'react'

const TICKER_ITEMS = [
  { id: 'a', content: <><b>NET</b> SOLANA · MAINNET·BETA</> },
  { id: 'b', content: <>POLICY VERSION <b>v1.4.2</b></> },
  { id: 'c', content: <>ANCHOR PROGRAM <b>OnL3sh11111111111111111111111111111111</b></> },
  { id: 'd', content: <><i style={{ fontStyle: 'normal', color: 'var(--magenta)' }}>HITL</i> WINDOW · 5:00</> },
  { id: 'e', content: <><b>+1,284</b> AGENTS DEPLOYED</> },
  { id: 'f', content: <><b>$2.1M</b> ROUTED THIS WEEK</> },
  { id: 'g', content: <><i style={{ fontStyle: 'normal', color: 'var(--magenta)' }}>BLOCKED</i> 318 OUT-OF-POLICY ATTEMPTS</> },
  { id: 'h', content: <>DEVNET LATENCY <b>312ms</b></> },
]

export default function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {TICKER_ITEMS.map(item => (
          <Fragment key={item.id}>
            <span>{item.content}</span>
            <span className="sep">/ /</span>
          </Fragment>
        ))}
        {TICKER_ITEMS.map(item => (
          <Fragment key={`${item.id}2`}>
            <span>{item.content}</span>
            <span className="sep">/ /</span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
