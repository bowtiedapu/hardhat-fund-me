// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * Explainer from: https://solidity-by-example.org/fallback/
 *
 * Ether is sent to contract
 *      is msg.data empty?
 *           /   \
 *          yes  no
 *          /      \
 *     receive()?  fallback()
 *       /   \
 *      yes   no
 *     /        \
 *  receive()  fallback()
 */
contract FallbackExample {
    uint256 public result;

    // As long as there's no data associated with the transaction, the receive function gets triggered.
    receive() external payable {
        result = 1;
        // Since we haven't set anything for result, it's initialized to 0.
        // Once deployed, if this contract is called without any calldata, then receive() will get invoked, and result gets set to 1
        // If data is sent, we need to have the fallback() function defined
    }

    fallback() external payable {
        result = 2;
        // If we do send calldata, result will get set to 2. If we don't receive() gets invoked instead.
    }
}
