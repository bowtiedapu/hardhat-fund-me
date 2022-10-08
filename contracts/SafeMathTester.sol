// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeMathTester {
    // 255 is the biggest number we can use in uint8
    uint8 public bigNumber = 255;

    function add() public {
        bigNumber = bigNumber + 1;
        // If we add, then bigNumber gets reset to 0. This means that uint8 is unchecked. This means that anytime we overflow, we wrap around back to 0
        // SafeMath was widely used to check that we weren't "wrapping around" back to 0.
        // If we use solidity ^0.6.0, we can see this overflow happen and we wrap back to 0
        // If we use solidity version ^0.8.0 we would see this fail
        // In ^0.8.0, if we want to work around this, simply do the following:
        unchecked {
            // This won't compile with version ^0.6.0
            bigNumber = bigNumber + 1;
        }
    }
}
