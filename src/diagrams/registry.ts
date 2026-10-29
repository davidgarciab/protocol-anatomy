import { closeFactorLabel, constantProductQuote, formatNumber, healthCheck } from '../lib/calculators';

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

interface CalculatorField {
  name: string;
  label: string;
  value: number;
  step?: string;
}

function calculator(
  kind: string,
  fields: CalculatorField[],
  results: { name: string; label: string; value: string }[],
): string {
  const inputs = fields
    .map(
      (field) =>
        `<label><span>${field.label}</span><input type="number" name="${field.name}" value="${field.value}" min="0" step="${field.step ?? 'any'}" inputmode="decimal"></label>`,
    )
    .join('');
  const outputs = results
    .map((result) => `<div><dt>${result.label}</dt><dd><output name="${result.name}">${result.value}</output></dd></div>`)
    .join('');
  return `<form class="calculator" data-calculator="${kind}"><div class="calc-inputs">${inputs}</div><dl class="calc-results" aria-live="polite">${outputs}</dl></form>`;
}

const swap = constantProductQuote(100, 300_000, 1, 30)!;
const health = healthCheck(10, 1_850, 80, 15_000)!;

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
  'range-holdings': figure(
    'What a concentrated position holds',
    'Simplified model',
    flow([
      {
        label: 'Price below the range',
        detail: 'The position holds token0 only. Token1 is zero. The liquidity is not earning fees.',
      },
      {
        label: 'Price inside the range',
        detail: 'The position holds both tokens. Fees accrue in proportion to its liquidity over other active liquidity.',
      },
      {
        label: 'Price above the range',
        detail: 'The position holds token1 only. Token0 is zero. The liquidity is not earning fees.',
      },
    ]),
    'The three cases are the branches in Uniswap v3 LiquidityAmounts.getAmountsForLiquidity and in v4 LiquidityAmounts.getLiquidityForAmounts. This is not a plot of a live pool, and a hook with custom accounting can opt out of the curve.',
  ),
  'swap-calculator': figure(
    'Try a constant-product swap',
    'Calculator',
    calculator(
      'swap',
      [
        { name: 'reserveIn', label: 'Reserve of the token paid in', value: 100 },
        { name: 'reserveOut', label: 'Reserve of the token paid out', value: 300_000 },
        { name: 'amountIn', label: 'Amount paid in', value: 1 },
        { name: 'feeBps', label: 'Fee in basis points (v2: 30)', value: 30, step: '1' },
      ],
      [
        { name: 'amountOut', label: 'Amount out', value: formatNumber(swap.amountOut) },
        { name: 'averagePrice', label: 'Average price paid', value: formatNumber(swap.averagePrice) },
        { name: 'spotBefore', label: 'Spot price before', value: formatNumber(swap.spotBefore) },
        { name: 'spotAfter', label: 'Spot price after', value: formatNumber(swap.spotAfter) },
        { name: 'priceGap', label: 'Average price below spot', value: `${formatNumber(swap.priceGap)}%` },
        { name: 'kGrowth', label: 'Growth of x · y', value: `${formatNumber(swap.kGrowth, 4)}%` },
      ],
    ),
    'Uses the v2 getAmountOut formula with real numbers instead of integer division, so the last digits can differ from a pair. Prices are in units of the output token per unit of the input token. With JavaScript off, the values shown are the worked example above.',
  ),
  'health-factor-calculator': figure(
    'Try an Aave health factor',
    'Calculator',
    calculator(
      'health',
      [
        { name: 'collateralAmount', label: 'Collateral amount', value: 10 },
        { name: 'collateralPrice', label: 'Collateral price in USD', value: 1_850 },
        { name: 'threshold', label: 'Liquidation threshold, percent', value: 80 },
        { name: 'debt', label: 'Debt in USD', value: 15_000 },
      ],
      [
        { name: 'healthFactor', label: 'Health factor', value: formatNumber(health.healthFactor, 4) },
        { name: 'liquidationPrice', label: 'Collateral price at HF 1', value: formatNumber(health.liquidationPrice) },
        { name: 'closeFactor', label: 'Max repaid in one call', value: closeFactorLabel(health) },
      ],
    ),
    'One collateral asset and one debt asset priced at 1 USD. The threshold is an input, not a live Aave parameter. The repay limit follows the V3.3 LiquidationLogic rule quoted above. With JavaScript off, the values shown are the worked example above.',
  ),
  'morpho-structure': figure(
    'One contract, isolated markets, curated vaults',
    'Morpho, simplified',
    `<div class="arch" role="group" aria-label="Depositors use vaults, vaults allocate to isolated markets inside one immutable contract">
      <p class="arch-label">Depositors hold vault shares, or supply to a market directly</p>
      <div class="arch-row">
        <div class="arch-box"><strong>Vault</strong><span>Curator sets caps and timelocks, allocator moves funds, sentinel only reduces risk</span></div>
      </div>
      <p class="arch-arrow" aria-hidden="true">allocate within caps</p>
      <div class="arch-row">
        <div class="arch-box"><strong>Market A</strong><span>Collateral X, loan asset, oracle, rate model, LLTV</span></div>
        <div class="arch-box"><strong>Market B</strong><span>A different collateral, oracle or LLTV. Its losses stay here</span></div>
      </div>
      <div class="arch-box arch-core"><strong>Morpho Blue</strong><span>One immutable contract. Market id is the hash of the five parameters</span></div>
    </div>`,
    'Simplified. A vault can also allocate through adapters to other venues, and Midnight is a separate contract set. A market cannot be edited after it is created.',
  ),
  'restaking-flow': figure(
    'From stake to a slash',
    'EigenLayer, simplified',
    flow([
      {
        label: 'Deposit',
        detail: 'A staker points validators at an EigenPod or deposits a token into a strategy and receives deposit shares.',
      },
      {
        label: 'Delegate',
        detail: 'The staker delegates to an operator. The operator’s weight is the sum of its delegators’ shares.',
      },
      {
        label: 'Allocate',
        detail: 'The operator registers for an operator set and allocates a proportion of its stake to it, after a delay. That allocation is unique stake.',
      },
      {
        label: 'Slash',
        detail: 'The set’s slasher calls the AllocationManager with a fraction. The operator’s allocation and maximum magnitude fall, and every delegator’s slashing factor falls with it.',
      },
      {
        label: 'Clear and exit',
        detail: 'Slashed shares are burned or redistributed after a delay. Withdrawals queue for about 14 days on mainnet.',
      },
    ]),
    'Delays are the mainnet values in the contract documentation at the time of reading. Whether a fault occurred is decided by the service, not by the core contracts.',
  ),
  'delta-neutral-flow': figure(
    'How a USDe mint is hedged',
    'Ethena, simplified',
    flow([
      {
        label: 'Signed order',
        detail: 'An approved counterparty signs an order against an off-chain price. Ethena’s backend checks it and submits it.',
      },
      {
        label: 'Backing to custody',
        detail: 'The incoming assets go to a registered custodian. USDe is minted.',
      },
      {
        label: 'Hedge',
        detail: 'A short futures position of about the same notional is opened. The custodian delegates margin value to the exchange without transferring the assets.',
      },
      {
        label: 'Settle',
        detail: 'Profit and loss settle between exchange and custodian, generally daily. Funding paid or received changes the protocol’s revenue.',
      },
      {
        label: 'Stake',
        detail: 'Holders can stake USDe as sUSDe. Rewards vest over eight hours and unstaking passes through a cooldown.',
      },
    ]),
    'Simplified to the crypto basis trade. The documentation describes a wider backing portfolio, and stable assets in it need no hedge.',
  ),
  'spark-allocation': figure(
    'How Spark moves liquidity',
    'Spark Liquidity Layer, simplified',
    `<div class="arch" role="group" aria-label="Governance sets rate limits, a relayer moves stablecoins only between approved venues">
      <p class="arch-label">Sky governance and Spark governance set venues and rate limits</p>
      <div class="arch-box arch-core"><strong>ALM controller and rate limits</strong><span>A venue with no configured limit cannot be used. Limits refill linearly up to a ceiling</span></div>
      <p class="arch-arrow" aria-hidden="true">relayer moves funds, freezer can revoke it</p>
      <div class="arch-row">
        <div class="arch-box"><strong>SparkLend</strong><span>Liquidity topped up or withdrawn by utilization</span></div>
        <div class="arch-box"><strong>Savings vaults</strong><span>Idle buffer refilled, liquidity intents filled</span></div>
        <div class="arch-box"><strong>Other venues</strong><span>Vaults, pools, PSM, bridges, OTC, RWAs</span></div>
      </div>
    </div>`,
    'Simplified from the Spark documentation. The list of integrations, the networks and the numeric limits are set by governance and change.',
  ),
  'yield-split': figure(
    'Splitting a yield-bearing token',
    'Pendle, simplified',
    flow([
      {
        label: 'Wrap',
        detail: 'A yield-bearing token becomes SY, which has no maturity and holds the token and its rewards.',
      },
      {
        label: 'Split',
        detail: 'SY deposited in the yield contract mints equal PT and YT, scaled by the SY index.',
      },
      {
        label: 'Trade',
        detail: 'PT trades against SY in a pool whose curve tightens toward maturity. YT trades through flash swaps in the same pool.',
      },
      {
        label: 'Mature',
        detail: 'PT redeems one-for-one for the accounting asset. YT is worth zero. Unredeemed matured positions stop earning for the holder.',
      },
    ]),
    'The accounting asset is the unit PT redeems in, which is not always the token itself. A PT price below par before maturity is the fixed rate.',
  ),
};

export const diagramNames = new Set(Object.keys(diagrams));
