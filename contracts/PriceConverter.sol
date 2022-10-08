// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Why is this a library and not abstract?
// Why not an interface?
library PriceConverter {
    /**
     * getPrice returns the current price from a given price feed.
     * This is set to view since it does *not* modify any state.
     *
     * If this was public, we would need to deploy this again
     */
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // Goerli ETH / USD Address
        // https://docs.chain.link/docs/ethereum-addresses/

        (, int256 answer, , , ) = priceFeed.latestRoundData();

        /**
         * Recall that in Solidity, we do *NOT* deal with decimals.
         * We need to understand how to convert correctly.
         * We could express 10000000000 as 1e10, which is 1**10.
         * For more info on how to convert, check out eth-converter.com
         * Keep in mind that if we just return "answer * 1e10", we will return
         * int256, where the expectation is to return uint256. To change types, we
         * must type cast as follows:
         */
        return uint256(answer * 10000000000);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        // If ETH is 1500 USD, then this ethPrice would tack on another 18 zeros, so
        // 1500_000000000000000000 which is the ETH/USD price
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        // 1000000000000000000 == 1e18
        // the actual ETH/USD conversion rate, after adjusting the extra 0s.
        return ethAmountInUsd;
    }
}
