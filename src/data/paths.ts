/** Reading orders. A step is `<collection>/<id>`; the build fails if one does not exist. */
export interface LearningPath {
  id: string;
  title: string;
  summary: string;
  steps: string[];
}

export const learningPaths: LearningPath[] = [
  {
    id: 'lending',
    title: 'How on-chain lending works',
    summary: 'From a utilization-priced pool to Aave’s V3 Pool and V4 hub, Compound’s single-base-asset markets, then isolated markets with Morpho and a capital allocator with Spark.',
    steps: [
      'concepts/lending-utilization',
      'concepts/interest-rate-models',
      'concepts/collateral-and-liquidation',
      'concepts/on-chain-accounting',
      'protocols/aave',
      'guides/aave-versions',
      'protocols/compound',
      'guides/compound-versions',
      'concepts/isolated-markets-and-curation',
      'protocols/morpho',
      'guides/morpho-versions',
      'protocols/euler',
      'guides/euler-vault-types',
      'protocols/spark',
      'guides/spark-savings-and-liquidity',
    ],
  },
  {
    id: 'exchanges',
    title: 'How on-chain exchanges price trades',
    summary: 'From the constant-product rule to concentrated liquidity, Uniswap v4, Curve and Balancer’s Vault.',
    steps: [
      'concepts/automated-market-makers',
      'concepts/constant-product',
      'concepts/liquidity-pools',
      'concepts/concentrated-liquidity',
      'concepts/impermanent-loss-and-lvr',
      'protocols/uniswap',
      'guides/uniswap-versions',
      'protocols/curve',
      'guides/curve-generations',
      'protocols/balancer',
      'guides/balancer-versions',
      'protocols/aerodrome',
      'guides/aerodrome-velodrome-and-aero',
    ],
  },
  {
    id: 'stablecoins',
    title: 'How collateralized stablecoins work',
    summary: 'Vaults, debt and liquidation in Maker, what changed with Sky, and the synthetic dollar built on funding rates.',
    steps: [
      'concepts/stablecoin-mechanisms',
      'concepts/collateral-and-liquidation',
      'protocols/maker-sky',
      'guides/maker-to-sky',
      'concepts/delta-neutral-dollars',
      'protocols/ethena',
      'guides/ethena-mint-and-exit',
    ],
  },
  {
    id: 'staking',
    title: 'How staking and restaking work',
    summary: 'Shares, rebases and the withdrawal queue with Lido, then restaking, operator sets and slashing with EigenLayer.',
    steps: [
      'concepts/liquid-staking',
      'protocols/lido',
      'guides/lido-exits',
      'protocols/rocket-pool',
      'guides/rocket-pool-minipools-and-megapools',
      'concepts/restaking-and-slashing',
      'protocols/eigenlayer',
      'guides/eigenlayer-slashing',
    ],
  },
  {
    id: 'yield',
    title: 'How yield is split and traded',
    summary: 'Principal and yield tokens, fixed rates, and what it takes to use a maturing token as collateral.',
    steps: [
      'concepts/yield-tokenization',
      'protocols/pendle',
      'guides/pendle-maturity-and-collateral',
    ],
  },
  {
    id: 'derivatives',
    title: 'How an on-chain exchange runs perpetuals',
    summary: 'An order book and margin engine on its own chain, a validator-run oracle, and the funding rate that synthetic dollars build on.',
    steps: [
      'concepts/collateral-and-liquidation',
      'protocols/hyperliquid',
      'guides/hyperliquid-hypercore-and-hip-3',
      'concepts/delta-neutral-dollars',
      'protocols/ethena',
    ],
  },
  {
    id: 'risk',
    title: 'Engineering and risk',
    summary: 'Composability, flash settlement, oracles, upgrades and the assumptions left over.',
    steps: [
      'concepts/composability',
      'concepts/flash-liquidity',
      'concepts/oracles-and-dependencies',
      'protocols/chainlink',
      'guides/chainlink-reading-a-feed',
      'protocols/safe',
      'guides/safe-modules-guards-and-delegatecall',
      'concepts/proxies',
      'concepts/governance-and-upgrades',
      'concepts/security-assumptions',
    ],
  },
];
