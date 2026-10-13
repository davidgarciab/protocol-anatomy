function figure(title: string, kicker: string, body: string, note: string): string {
  return `<figure class="diagram">
  <figcaption><span class="diagram-kicker">${kicker}</span> <span class="diagram-title">${title}</span></figcaption>
  ${body}
  <p class="diagram-note">${note}</p>
</figure>`;
}

function flow(items: { label: string; detail: string }[]): string {
  const steps = items
    .map(
      (item) =>
        `<li><span class="flow-label">${item.label}</span><span class="flow-detail">${item.detail}</span></li>`,
    )
    .join('');
  return `<ol class="flow">${steps}</ol>`;
}

export const diagrams: Record<string, string> = {
  'swap-flow': figure(
    'A routed swap',
    'Simplified model',
    flow([
      {
        label: 'Trader',
        detail: 'Chooses an input token, an output token, and a limit such as a minimum amount out.',
      },
      {
        label: 'Router or interface',
        detail:
          'Selects one or more pools. This step can include off-chain routing and is not itself the invariant.',
      },
      {
        label: 'Pool',
        detail:
          'Applies the pool’s pricing rule to its reserves or in-range liquidity, charges the pool fee, and updates state.',
      },
      {
        label: 'Settlement',
        detail:
          'The input token is taken from the trader and the output token is sent on. A callback, a prior transfer, or flash settlement can be the payment method, depending on the version.',
      },
    ]),
    'This is not a literal call trace. v2, v3, and v4 settle tokens differently, and a router may split one trade across several pools.',
  ),
  'lending-flow': figure(
    'Supply, borrow, and repay',
    'Simplified model',
    flow([
      {
        label: 'Supply',
        detail: 'The underlying asset enters the shared pool. The supplier receives a claim that grows with interest.',
      },
      {
        label: 'Collateral',
        detail: 'The supplied asset can be enabled as collateral, subject to a collateral factor or liquidation threshold.',
      },
      {
        label: 'Borrow',
        detail: 'The protocol checks account health, transfers liquidity to the borrower, and records debt that accrues interest.',
      },
      {
        label: 'Repay or withdraw',
        detail: 'Repayment reduces debt. Withdrawal is allowed when the remaining position still satisfies the health check.',
      },
    ]),
    'Interest is usually accrued lazily when a reserve is touched, not by a transaction on every block. The diagram omits liquidations and governance parameter changes.',
  ),
  'liquidation-flow': figure(
    'Collateral liquidation',
    'Simplified model',
    flow([
      {
        label: 'Price or debt update',
        detail: 'An oracle update or accrued interest can push a position below its solvency threshold.',
      },
      {
        label: 'Eligibility',
        detail: 'Anyone who calls the liquidation function can act. The protocol does not wait for the borrower.',
      },
      {
        label: 'Repay and seize',
        detail: 'The liquidator covers some debt and receives collateral, often with a bonus, minus any protocol fee.',
      },
      {
        label: 'Residual risk',
        detail: 'If collateral cannot cover the debt, the shortfall is bad debt or a protocol deficit. Auctions and close factors change how much is settled at once.',
      },
    ]),
      'Aave, Maker, and Curve’s crvUSD system do not liquidate in the same way. Aave V4’s overview adds a limit this sequence omits: a user cannot liquidate their own position. Read the protocol page before treating the steps as an implementation.',
  ),
  'stablecoin-flow': figure(
    'Collateralized stablecoin issuance',
    'Simplified model',
    flow([
      {
        label: 'Lock collateral',
        detail: 'A user posts an asset the protocol is willing to count. The collateral is accounted per position and per collateral type.',
      },
      {
        label: 'Draw debt',
        detail: 'The protocol mints stablecoin debt against that collateral, up to a ceiling and a collateralization rule.',
      },
      {
        label: 'Fees',
        detail: 'Debt grows by a governance-set stability fee, or another fee rule. The fee is system revenue, not a market price.',
      },
      {
        label: 'Repay or liquidate',
        detail: 'Repaying debt releases collateral. An unsafe position can be liquidated. A peg module can swap the stablecoin with an external asset without touching a vault.',
      },
    ]),
    'This matches the shape of a vault-based stablecoin such as DAI. It is not a description of a fiat-backed token, and it is not Curve’s StableSwap pool.',
  ),
  'staking-flow': figure(
    'Liquid staking deposit and exit',
    'Simplified model',
    flow([
      {
        label: 'Deposit',
        detail: 'The user sends the staking asset and receives a liquid claim. The claim is a share of the pool, not a receipt for a named validator.',
      },
      {
        label: 'Delegation',
        detail: 'The protocol assigns stake to operators or validators. Rewards and penalties land in the pool.',
      },
      {
        label: 'Accounting report',
        detail: 'An oracle or similar reporter updates the pool’s asset balance. Share value changes for every holder.',
      },
      {
        label: 'Exit',
        detail: 'Withdrawal is a request, then a wait, then a claim. It is not the same transaction as a transfer of the liquid token.',
      },
    ]),
    'This is the pooled shape, such as Lido Core. A Lido V3 staking vault is one owner and one operator, and its validator exit is not this queue. The reporter and the operator set remain trust boundaries. Transferring the liquid token does not by itself unstake the underlying asset.',
  ),
  'hub-spoke': figure(
    'Hub and spokes',
    'Aave V4, simplified',
    `<div class="arch" role="group" aria-label="Users reach spokes, and spokes draw from a hub">
      <p class="arch-label">Users supply, borrow, repay, and withdraw here</p>
      <div class="arch-row">
        <div class="arch-box"><strong>Spoke</strong><span>User positions, collateral configuration, oracle</span></div>
        <div class="arch-box"><strong>Spoke</strong><span>A separate market with its own risk parameters</span></div>
      </div>
      <p class="arch-arrow" aria-hidden="true">draw and repay liquidity</p>
      <div class="arch-box arch-core"><strong>Hub</strong><span>Shared liquidity, caps, utilization rate, accounting invariants</span></div>
    </div>`,
    'The V4 overview describes the Hub as immutable and Spokes as upgradeable. Several hubs can exist. This drawing shows one hub and two spokes, not a specific deployment’s asset list.',
  ),
  'curve-shapes': figure(
    'Two pricing shapes',
    'Conceptual illustration',
    `<svg class="curve-svg" viewBox="0 0 640 300" role="img" aria-labelledby="curve-shapes-title curve-shapes-desc">
      <title id="curve-shapes-title">Constant-product and StableSwap shapes</title>
      <desc id="curve-shapes-desc">A constant-product curve bends across the whole price range. A StableSwap-style curve stays flatter near the peg and steepens when balances diverge.</desc>
      <line x1="48" y1="24" x2="48" y2="260" class="axis"></line>
      <line x1="48" y1="260" x2="600" y2="260" class="axis"></line>
      <path d="M72 42 C 150 70, 250 150, 560 246" class="curve-product"></path>
      <path d="M72 70 C 150 210, 230 236, 320 240 C 430 244, 500 230, 560 70" class="curve-stable"></path>
    </svg>
    <ul class="legend">
      <li><span class="swatch swatch-muted"></span> Constant product: liquidity is spread from a very low price to a very high price.</li>
      <li><span class="swatch swatch-accent"></span> StableSwap shape: more of the liquidity sits near equal balances, then the curve steepens.</li>
    </ul>`,
    'The paths are drawn to show the idea. They are not a plot of a live pool and they are not the StableSwap invariant evaluated at a particular amplification coefficient.',
  ),
};

export const diagramNames = new Set(Object.keys(diagrams));
