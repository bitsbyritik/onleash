function CodeBlock({ file, lang, children }: { file: string; lang: string; children: React.ReactNode }) {
  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span className="cb-file">{file}</span>
        <span>{lang}</span>
      </div>
      <pre className="codeblock-body">{children}</pre>
    </div>
  )
}

export default function SnippetSection() {
  return (
    <section className="section" id="code">
      <div className="container">
        <div>
          <div className="eyebrow">Wire it up · 14 lines</div>
          <h2 className="section-title">
            Three lines to install.<br />
            <span style={{ color: 'var(--mint)' }}>One line</span> to send.
          </h2>
          <p className="section-sub">
            Drop into Solana Agent Kit, LangChain, or CrewAI. Your existing keypair becomes a leashed wallet.
          </p>
        </div>

        <div className="codeblock-grid" id="install">
          <CodeBlock file="install.sh" lang="bash">
            <span className="code-c"># 1. install</span>{'\n'}
            {'$ npm i '}<span className="code-fn">@onleash/sdk</span>{'\n\n'}
            <span className="code-c"># 2. set api key</span>{'\n'}
            {'$ leash login '}<span className="code-str">--key onl_sk_•••</span>{'\n\n'}
            <span className="code-c"># 3. deploy a policy</span>{'\n'}
            {'$ leash policy:create \\\n'}
            {'  '}<span className="code-str">--cap 100</span>{' \\\n'}
            {'  '}<span className="code-str">--vendor-cap 25</span>{' \\\n'}
            {'  '}<span className="code-str">--hitl 50</span>{' \\\n'}
            {'  '}<span className="code-str">--telegram @OnLeashBot</span>{'\n\n'}
            <span className="code-c">✓ policy deployed · pda 7gXq…4mJp</span>
          </CodeBlock>

          <CodeBlock file="agent.ts" lang="typescript">
            <span className="code-kw">import</span>{' { '}<span className="code-cls">LeashWallet</span>{' } '}
            <span className="code-kw">from</span>{' '}
            <span className="code-str">&quot;@onleash/sdk&quot;</span>{'\n'}
            <span className="code-kw">import</span>{' { '}<span className="code-cls">Keypair</span>{' } '}
            <span className="code-kw">from</span>{' '}
            <span className="code-str">&quot;@solana/web3.js&quot;</span>{'\n\n'}
            <span className="code-kw">const</span>{' wallet = '}
            <span className="code-kw">new</span>{' '}
            <span className="code-cls">LeashWallet</span>{'({\n'}
            {'  '}<span className="code-prop">keypair</span>{': '}
            <span className="code-cls">Keypair</span>{'.'}
            <span className="code-fn">generate</span>{'(),\n'}
            {'  '}<span className="code-prop">apiKey</span>{': process.env.'}
            <span className="code-cls">ONLEASH_KEY</span>{'!,\n'}
            {'});\n\n'}
            <span className="code-c">{'// Pre‑checks → onchain → HITL if needed'}</span>{'\n'}
            <span className="code-kw">await</span>{' wallet.'}
            <span className="code-fn">send</span>{'({\n'}
            {'  '}<span className="code-prop">to</span>{':     '}
            <span className="code-str">&quot;8aZKj…3mNp&quot;</span>{',\n'}
            {'  '}<span className="code-prop">amount</span>{': '}
            <span className="code-num">60</span>{',\n'}
            {'  '}<span className="code-prop">token</span>{':  '}
            <span className="code-str">&quot;USDC&quot;</span>{',\n'}
            {'});  '}<span className="code-c">{'// → throws or returns sig'}</span>
          </CodeBlock>
        </div>
      </div>
    </section>
  )
}
