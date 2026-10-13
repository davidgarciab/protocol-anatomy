export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  related: { href: string; label: string }[];
}

export const glossary: GlossaryEntry[] = [
  {
    id: 'amplification-coefficient',
    term: 'Amplification coefficient',
    definition:
      'The parameter A in Curve StableSwap. Larger values pull the pricing curve closer to a constant sum while balances remain near the peg, which reduces slippage for similarly priced assets and makes the price fall faster once balances diverge.',
    related: [
      { href: '/protocols/curve', label: 'Curve' },
      { href: '/concepts/constant-product', label: 'Constant product' },
    ],
  },
  {
    id: 'atoken',
    term: 'aToken',
    definition:
      'The interest-bearing claim minted by an Aave V3 market when a user supplies an asset. The token is pegged one-for-one to the underlying asset in the protocol’s accounting, and the balance grows as the reserve’s liquidity index grows.',
    related: [
      { href: '/protocols/aave', label: 'Aave' },
      { href: '/concepts/on-chain-accounting', label: 'On-chain accounting' },
    ],
  },
  {
    id: 'bad-debt',
    term: 'Bad debt',
    definition:
      'Debt that remains after the collateral securing it has been exhausted. In a lending pool it is a loss shared through the reserve; in Aave V4 the overview calls the comparable shortfall a deficit that spokes can eliminate from supplied shares.',
    related: [
      { href: '/concepts/collateral-and-liquidation', label: 'Collateral and liquidation' },
      { href: '/guides/aave-versions', label: 'Aave versions' },
    ],
  },
  {
    id: 'close-factor',
    term: 'Close factor',
    definition:
      'The fraction of a borrower’s debt that a single liquidation may repay. Aave’s V4 overview describes V3’s default close factor as 50 percent, with a 100 percent close factor in specified unhealthy or small-position cases. V4 replaces that default with a target health factor.',
    related: [{ href: '/guides/aave-versions', label: 'Aave versions' }],
  },
  {
    id: 'collateral-factor',
    term: 'Collateral factor',
    definition:
      'A risk parameter that limits how much of an asset’s value counts toward borrowing power. Aave V4 stores collateralization parameters, including the collateral factor, in dynamic configuration keys so a change can apply to new positions without rewriting every open position.',
    related: [
      { href: '/protocols/aave', label: 'Aave' },
      { href: '/concepts/collateral-and-liquidation', label: 'Collateral and liquidation' },
    ],
  },
  {
    id: 'concentrated-liquidity',
    term: 'Concentrated liquidity',
    definition:
      'Liquidity that is active only between two prices. Uniswap v3 introduced it, and v4 keeps the same pricing idea: a position earns fees only while the pool price is inside its range, and outside that range the position holds only one of the two assets.',
    related: [
      { href: '/concepts/concentrated-liquidity', label: 'Concentrated liquidity' },
      { href: '/protocols/uniswap', label: 'Uniswap' },
    ],
  },
  {
    id: 'constant-product',
    term: 'Constant product',
    definition:
      'The invariant x · y = k used by Uniswap v2. A swap changes the two reserves but may not decrease the product after the fee. The marginal price is the ratio of the reserves, so larger trades move the price more.',
    related: [
      { href: '/concepts/constant-product', label: 'Constant product' },
      { href: '/protocols/uniswap', label: 'Uniswap' },
    ],
  },
  {
    id: 'cryptoswap',
    term: 'CryptoSwap',
    definition:
      'Curve’s invariant for assets that are not expected to hold a peg. It keeps liquidity concentrated around an internal price scale and changes shape away from that scale through the amplification coefficient and gamma. It is a different pool family from StableSwap.',
    related: [
      { href: '/protocols/curve', label: 'Curve' },
      { href: '/guides/curve-generations', label: 'Curve pool generations' },
    ],
  },
  {
    id: 'dai',
    term: 'DAI',
    definition:
      'The stablecoin accounted for by Maker’s Vat. Vault debt is denominated in DAI, and the Sky documentation describes a converter that exchanges DAI and USDS one-for-one in both directions with no fee.',
    related: [
      { href: '/protocols/maker-sky', label: 'MakerDAO / Sky' },
      { href: '/concepts/stablecoin-mechanisms', label: 'Stablecoin mechanisms' },
    ],
  },
  {
    id: 'dutch-auction',
    term: 'Dutch auction',
    definition:
      'A sale that starts at a high price and falls until a buyer accepts it. Aave V4 uses the phrase for a liquidation bonus that increases as health factor falls. Maker’s collateral auctions are a separate implementation in the dss liquidation contracts.',
    related: [{ href: '/concepts/collateral-and-liquidation', label: 'Collateral and liquidation' }],
  },
  {
    id: 'efficiency-mode',
    term: 'Efficiency mode',
    definition:
      'An Aave V3 category for correlated assets, often called eMode. Positions that opt into a category can use the category’s collateral parameters instead of the looser parameters that must work for every asset in the market.',
    related: [{ href: '/guides/aave-versions', label: 'Aave versions' }],
  },
  {
    id: 'erc-4626',
    term: 'ERC-4626',
    definition:
      'A tokenized-vault interface with deposit, mint, withdraw, redeem, and share-to-asset conversion. Sky’s sUSDS contract implements it for the Sky Savings Rate. Curve Stableswap-NG can also treat an ERC-4626 token as an asset type whose rate comes from convertToAssets.',
    related: [
      { href: '/protocols/maker-sky', label: 'MakerDAO / Sky' },
      { href: '/concepts/on-chain-accounting', label: 'On-chain accounting' },
    ],
  },
  {
    id: 'flash-accounting',
    term: 'Flash accounting',
    definition:
      'Uniswap v4’s practice of recording token deltas during a PoolManager unlock and transferring tokens only at settlement. A multi-hop swap can therefore avoid moving the intermediate token between pools. ERC-6909 claims are an optional balance inside that settlement. They are not the ERC-721 liquidity position.',
    related: [
      { href: '/guides/uniswap-versions', label: 'Uniswap versions' },
      { href: '/concepts/composability', label: 'Composability' },
    ],
  },
  {
    id: 'fxswap',
    term: 'FXSwap',
    definition:
      'A Curve two-asset pool for markets whose price is discovered elsewhere. It prices with a StableSwap-style curve and recenters that curve using trading profit plus an explicit refuel budget. The refuel pays for recentering. It does not set the price.',
    related: [
      { href: '/protocols/curve', label: 'Curve' },
      { href: '/guides/curve-generations', label: 'Curve pool generations' },
    ],
  },
  {
    id: 'health-factor',
    term: 'Health factor',
    definition:
      'Aave’s scalar for whether a borrower’s collateral still covers their debt after risk parameters. The V4 documentation sets the liquidation threshold of this factor at 1. Below that, a liquidation call is eligible.',
    related: [
      { href: '/protocols/aave', label: 'Aave' },
      { href: '/concepts/collateral-and-liquidation', label: 'Collateral and liquidation' },
    ],
  },
  {
    id: 'hook',
    term: 'Hook',
    definition:
      'An optional contract attached to a Uniswap v4 pool. The hook address is part of the pool key and is fixed when the pool is initialized. It can run before or after initialize, liquidity changes, swaps, and donations, and only if the pool’s permission flags allow that callback.',
    related: [
      { href: '/protocols/uniswap', label: 'Uniswap' },
      { href: '/guides/uniswap-versions', label: 'Uniswap versions' },
    ],
  },
  {
    id: 'hub',
    term: 'Hub',
    definition:
      'The immutable liquidity coordinator in Aave V4. It tracks supplied and borrowed shares for each asset, sets spoke add and draw caps, applies the utilization-based drawn rate, and enforces the accounting invariants described in the V4 overview.',
    related: [
      { href: '/protocols/aave', label: 'Aave' },
      { href: '/guides/aave-versions', label: 'Aave versions' },
    ],
  },
  {
    id: 'isolation-mode',
    term: 'Isolation mode',
    definition:
      'An Aave V3 constraint for a risky collateral. A user who enables an isolated asset as collateral can borrow only the assets governance has listed for that isolation setting, and only up to a debt ceiling.',
    related: [{ href: '/guides/aave-versions', label: 'Aave versions' }],
  },
  {
    id: 'liquidation-bonus',
    term: 'Liquidation bonus',
    definition:
      'Extra collateral transferred to a liquidator beyond the value of the debt repaid. In Aave V3 the bonus is a static reserve parameter. In V4 it varies with health factor between a minimum and a configured maximum.',
    related: [{ href: '/concepts/collateral-and-liquidation', label: 'Collateral and liquidation' }],
  },
  {
    id: 'liquidation-threshold',
    term: 'Liquidation threshold',
    definition:
      'The percentage of collateral value that debt may reach before a position can be liquidated. It is distinct from the loan-to-value used to open a borrow: a position can be forbidden from borrowing more and still be above the liquidation threshold.',
    related: [{ href: '/concepts/collateral-and-liquidation', label: 'Collateral and liquidation' }],
  },
  {
    id: 'liquidity-index',
    term: 'Liquidity index',
    definition:
      'The cumulative supply-interest multiplier for an Aave reserve. Supplier balances are stored in scaled units and converted to underlying units by this index, so interest does not require a token transfer to each supplier.',
    related: [
      { href: '/protocols/aave', label: 'Aave' },
      { href: '/concepts/interest-rate-models', label: 'Interest-rate models' },
    ],
  },
  {
    id: 'liquidity-pool',
    term: 'Liquidity pool',
    definition:
      'A contract that holds reserves of two or more assets and prices swaps against those reserves. The pool’s accounting, not an order book, determines the execution price. Different protocols represent the liquidity provider’s claim as an ERC-20, an NFT, or an internal share.',
    related: [{ href: '/concepts/liquidity-pools', label: 'Liquidity pools' }],
  },
  {
    id: 'lp-share',
    term: 'LP share',
    definition:
      'A liquidity provider’s claim on a pool. Uniswap v2 mints a fungible ERC-20. Uniswap v3 and v4 both record a ranged position as an ERC-721, from NonfungiblePositionManager and PositionManager respectively. Curve Stableswap-NG uses the pool contract itself as the LP token. The share is a claim on pool assets and fees, not a promise of the tokens originally deposited.',
    related: [{ href: '/concepts/liquidity-pools', label: 'Liquidity pools' }],
  },
  {
    id: 'metapool',
    term: 'Metapool',
    definition:
      'A Curve pool that pairs one asset with the LP token of another Curve pool. A trader can swap the new asset against any coin inside the base pool, while the base pool’s liquidity stays in its own contract.',
    related: [{ href: '/guides/curve-generations', label: 'Curve pool generations' }],
  },
  {
    id: 'node-operator',
    term: 'Node operator',
    definition:
      'An organization or module participant that runs validators for a liquid staking protocol. Lido does not operate every validator itself. Rewards, penalties, and liveness depend on those operators and on Ethereum’s consensus rules.',
    related: [{ href: '/protocols/lido', label: 'Lido' }],
  },
  {
    id: 'normalized-debt',
    term: 'Normalized debt',
    definition:
      'Maker’s art field: vault debt stored before the stability-fee multiplier. Current debt is art multiplied by the collateral type’s rate. Updating the rate updates every vault of that type without writing each vault.',
    related: [
      { href: '/protocols/maker-sky', label: 'MakerDAO / Sky' },
      { href: '/concepts/on-chain-accounting', label: 'On-chain accounting' },
    ],
  },
  {
    id: 'oracle',
    term: 'Oracle',
    definition:
      'A contract or committee that brings an off-chain or cross-domain observation on chain, such as a price, a validator balance, or a collateral exchange rate. The observation is an input to solvency or accounting. It is not enforced by the AMM or lending invariant itself.',
    related: [{ href: '/concepts/oracles-and-dependencies', label: 'Oracles and dependencies' }],
  },
  {
    id: 'peg-stability-module',
    term: 'Peg stability module',
    definition:
      'A Maker facility that swaps DAI with an approved external stablecoin at a fixed rate, within a debt ceiling. Sky’s current token-route documentation points integrators to LitePSM for DAI–USDC and a USDS–USDC wrapper. It is not a vault and it does not price the swap on a curve.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'proxy',
    term: 'Proxy',
    definition:
      'A contract whose address stays fixed while a separate implementation contract holds the logic. Calls are delegated to the implementation. Aave V3 markets and Sky’s USDS token use this pattern. Uniswap’s core pools are documented as non-upgradeable instead.',
    related: [{ href: '/concepts/proxies', label: 'Proxies' }],
  },
  {
    id: 'rebase',
    term: 'Rebase',
    definition:
      'A balance update that changes how many tokens an account holds without a transfer. stETH rebases when Lido’s accounting report changes the value of each share. wstETH avoids that by keeping a static balance whose stETH value changes.',
    related: [
      { href: '/protocols/lido', label: 'Lido' },
      { href: '/concepts/liquid-staking', label: 'Liquid staking' },
    ],
  },
  {
    id: 'reserve-factor',
    term: 'Reserve factor',
    definition:
      'The share of borrow interest that an Aave reserve diverts to the treasury rather than to suppliers. Because of it, the supply rate is lower than utilization multiplied by the borrow rate.',
    related: [{ href: '/concepts/interest-rate-models', label: 'Interest-rate models' }],
  },
  {
    id: 'risk-premium',
    term: 'Risk premium',
    definition:
      'In Aave V4, extra borrow interest determined by the collateral a user actually relies on. The protocol sorts collateral from safer to riskier, covers the debt with the safer assets first, and charges a premium from that weighted collateral risk. The premium is tracked with extra debt shares, not as a second token the user holds.',
    related: [
      { href: '/protocols/aave', label: 'Aave' },
      { href: '/guides/aave-versions', label: 'Aave versions' },
    ],
  },
  {
    id: 'share',
    term: 'Share',
    definition:
      'A unit of ownership in a pooled balance. Lido mints stETH shares when ether is submitted. The stETH balance is the shares priced at the current pooled-ether rate. Curve and Aave also use share or scaled-balance accounting, but the rate that reprices the share is different in each system.',
    related: [{ href: '/concepts/on-chain-accounting', label: 'On-chain accounting' }],
  },
  {
    id: 'sky-savings-rate',
    term: 'Sky Savings Rate',
    definition:
      'The governance-set rate paid to USDS deposited in the sUSDS vault. Sky’s documentation describes it as funded by protocol revenue and distinct from a utilization curve. sUSDS is the ERC-4626 token for that deposit.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'spoke',
    term: 'Spoke',
    definition:
      'An upgradeable, user-facing lending module in Aave V4. Users call the spoke. The spoke draws and returns liquidity at a hub, applies its own oracle and collateral configuration, and can be added or halted without moving the hub’s reserves to a new contract.',
    related: [{ href: '/protocols/aave', label: 'Aave' }],
  },
  {
    id: 'stability-fee',
    term: 'Stability fee',
    definition:
      'The interest rate on Maker vault debt. The Jug stores a per-second rate. Calling drip folds the accrued multiplier into the Vat’s rate for that collateral type, which increases art · rate for every vault of that type and credits the system surplus.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'stableswap',
    term: 'StableSwap',
    definition:
      'Curve’s invariant for assets that should trade near a common price. It blends a constant-sum region, controlled by the amplification coefficient, with constant-product behavior when the pool is imbalanced.',
    related: [
      { href: '/protocols/curve', label: 'Curve' },
      { href: '/guides/curve-generations', label: 'Curve pool generations' },
    ],
  },
  {
    id: 'staking-vault',
    term: 'Staking vault',
    definition:
      'An isolated Lido V3 position: one owner, one node operator, and withdrawal credentials pointed at the vault. The owner can mint stETH against the vault’s reported value up to a reserve ratio the DAO sets. It is not a share of the pooled Lido Core stake.',
    related: [
      { href: '/protocols/lido', label: 'Lido' },
      { href: '/concepts/liquid-staking', label: 'Liquid staking' },
    ],
  },
  {
    id: 'steth',
    term: 'stETH',
    definition:
      'Lido’s rebasing liquid staking token. A holder’s balance changes when the protocol’s share rate changes. The balance represents a claim on pooled ether, including rewards and penalties, not a fixed one-to-one claim on a specific validator.',
    related: [
      { href: '/protocols/lido', label: 'Lido' },
      { href: '/concepts/liquid-staking', label: 'Liquid staking' },
    ],
  },
  {
    id: 'stusds',
    term: 'stUSDS',
    definition:
      'Sky’s ERC-4626 deposit of USDS for the stUSDS module. The token docs describe it as risk capital that funds SKY-backed borrowing. It is not the Sky Savings Rate and it is not the one-for-one DAI converter.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'susds',
    term: 'sUSDS',
    definition:
      'Savings USDS, an ERC-4626 vault for the Sky Savings Rate. Depositing USDS mints shares. The share price accrues with the savings rate. Sky’s token routes note that sUSDS and the older sDAI token are not one-for-one claims on each other.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'tick',
    term: 'Tick',
    definition:
      'A discrete price boundary in Uniswap v3 and v4. Tick i represents the price 1.0001^i, so one step of one tick is one basis point. A pool only initializes ticks on its tick spacing. In v3 that spacing is paired with the fee tier. In v4 it is a separate field on the pool key.',
    related: [{ href: '/concepts/concentrated-liquidity', label: 'Concentrated liquidity' }],
  },
  {
    id: 'usds',
    term: 'USDS',
    definition:
      'Sky’s upgrade of DAI. The official converter exchanges it with DAI at one-to-one, with no fee, and the documentation says a fee cannot be enabled on that route later. The token contract is upgradeable through a UUPS proxy.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'utilization',
    term: 'Utilization',
    definition:
      'Borrowed liquidity divided by supplied liquidity in a lending reserve. Aave’s interest strategy uses it as the main input to the borrow rate: rates rise slowly up to an optimal utilization and faster after that.',
    related: [{ href: '/concepts/lending-utilization', label: 'Lending utilization' }],
  },
  {
    id: 'variable-debt-token',
    term: 'Variable debt token',
    definition:
      'The non-transferable token that records variable-rate debt in an Aave V3 market. Its balance is principal plus accrued borrow interest. The V3 pool documentation says new borrows pass interest-rate mode 2, the variable mode. Stable-rate mode is deprecated.',
    related: [{ href: '/protocols/aave', label: 'Aave' }],
  },
  {
    id: 'vault',
    term: 'Vault',
    definition:
      'A Maker position stored in the Vat as an urn: ink is locked collateral and art is normalized debt. The vault is not an ERC-4626 vault. sUSDS is a separate tokenized savings vault.',
    related: [{ href: '/protocols/maker-sky', label: 'MakerDAO / Sky' }],
  },
  {
    id: 'withdrawal-request',
    term: 'Withdrawal request',
    definition:
      'A Lido queue entry that burns or locks stETH and later pays ETH. The request is an ERC-721 called unstETH. It can be claimed only after the accounting oracle finalizes it.',
    related: [
      { href: '/protocols/lido', label: 'Lido' },
      { href: '/guides/lido-exits', label: 'Lido exits' },
    ],
  },
  {
    id: 'wsteth',
    term: 'wstETH',
    definition:
      'Wrapped stETH. The wrapper locks stETH and mints a balance equal to the underlying shares, so the balance does not rebase. Its value in stETH rises when the share rate rises. Lido’s integration guide recommends it for contracts that assume a static ERC-20 balance.',
    related: [{ href: '/protocols/lido', label: 'Lido' }],
  },
];

const ids = new Set<string>();
for (const entry of glossary) {
  if (ids.has(entry.id)) throw new Error(`Duplicate glossary id ${entry.id}`);
  ids.add(entry.id);
}
