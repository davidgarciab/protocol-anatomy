# Drafts for review

These posts are for a person to edit and publish. They are not scheduled, and they do not claim a personal trade, a measured audience, or an endorsement.

## Three X posts

A Uniswap concentrated position is not split evenly across both tokens. At or below its range it holds token0 only. At or above it, token1 only. Inside, both. v3 and v4 use those three branches.

Leaving a Uniswap tick range is not a liquidation. Fees stop. The position becomes one asset. If the price returns, the same liquidity is active again without a new deposit. No amount function seizes it for being out of range.

v3 and v4 use the same square-root amount formulas. The signed result does not match. In v4, adding liquidity returns a negative delta: the caller owes the pool. v3 returns a positive token amount, rounded up.

## Thread outline

1. The useful question is which tokens a concentrated position holds at the current price, not how much liquidity was deposited.
2. Three branches, from v3 LiquidityAmounts.getAmountsForLiquidity: at or below the lower price, token0 only; inside the range, both; at or above the upper price, token1 only.
3. The shapes in SqrtPriceMath: token0 is liquidity times the difference of the reciprocal square-root prices. Token1 is liquidity times the difference of the square-root prices. The contracts use Q64.96, not floating point.
4. Rounding favors the pool. Adding liquidity rounds the token amount up. Removing it rounds down.
5. v4’s signed helper flips the sign. A negative delta means the caller owes the pool. A v3 check that treats a positive amount as “user pays” reads a v4 delta backwards.
6. Out of range is inventory, not a penalty. Fees stop. Coming back into range reactivates the same liquidity.
7. Page and the two files: https://protocols.davidgarciab.com/concepts/concentrated-liquidity/ and https://github.com/Uniswap/v3-periphery/blob/b6b885569786a319d853acc610ed03884fda9bee/contracts/libraries/LiquidityAmounts.sol

## LinkedIn

Uniswap v3 and v4 do not keep a liquidity position in both tokens at every price. The position is token0 below its range, token1 above it, and a mix only while the price is inside. That single-asset result is the normal edge of the curve, not a liquidation.

The amount formulas match across the two versions. The accounting sign does not. v4 records an added position as a negative delta, meaning the caller still owes the pool, and it rounds that amount up. Treating the v3 “positive amount” convention as universal will invert who pays.

Notes and the cited commits: https://protocols.davidgarciab.com/concepts/concentrated-liquidity/

## For an engineering reader

To value a concentrated position, take the current square-root price and the position’s two boundaries. At or below the lower boundary, compute only the token0 delta across the whole range. Inside, compute token0 from the current price to the upper boundary and token1 from the lower boundary to the current price. At or above the upper boundary, compute only the token1 delta. Use the round-up path when liquidity is being added and the round-down path when it is being removed. On v4, negate the added-liquidity result: the caller owes that amount. None of these branches closes the position.
