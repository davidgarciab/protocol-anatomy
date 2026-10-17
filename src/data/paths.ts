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
    summary: 'From a utilization-priced pool to Aave’s V3 Pool and V4 hub.',
    steps: [
      'concepts/lending-utilization',
      'concepts/interest-rate-models',
      'concepts/collateral-and-liquidation',
      'concepts/on-chain-accounting',
      'protocols/aave',
      'guides/aave-versions',
    ],
  },
  {
    id: 'exchanges',
    title: 'How on-chain exchanges price trades',
    summary: 'From the constant-product rule to concentrated liquidity, Uniswap v4 and Curve.',
    steps: [
      'concepts/automated-market-makers',
      'concepts/constant-product',
      'concepts/liquidity-pools',
      'concepts/concentrated-liquidity',
      'protocols/uniswap',
      'guides/uniswap-versions',
      'protocols/curve',
      'guides/curve-generations',
    ],
  },
  {
    id: 'stablecoins',
    title: 'How collateralized stablecoins work',
    summary: 'Vaults, debt and liquidation in Maker, and what changed with Sky.',
    steps: [
      'concepts/stablecoin-mechanisms',
      'concepts/collateral-and-liquidation',
      'protocols/maker-sky',
      'guides/maker-to-sky',
    ],
  },
  {
    id: 'staking',
    title: 'How liquid staking works',
    summary: 'Shares, rebases and the withdrawal queue, using Lido.',
    steps: ['concepts/liquid-staking', 'protocols/lido', 'guides/lido-exits'],
  },
  {
    id: 'risk',
    title: 'Engineering and risk',
    summary: 'Composability, flash settlement, oracles, upgrades and the assumptions left over.',
    steps: [
      'concepts/composability',
      'concepts/flash-liquidity',
      'concepts/oracles-and-dependencies',
      'concepts/proxies',
      'concepts/governance-and-upgrades',
      'concepts/security-assumptions',
    ],
  },
];
