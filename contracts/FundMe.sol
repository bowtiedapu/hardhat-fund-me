// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Using error is more gas efficient compared to using `require` with a string
error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author BowTiedApu
 * @notice This contract is to demo a sample funding contract purely for learning purposes
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    /**
     * Some more information on keywords:
     * constant - can never be changed after compilation.
     * immutable - can be set within the constructor
     *
     * Both constant and immutable does not reserve a storage spot for variables market constant or immutable
     */
    address private immutable i_owner;

    // This won't change after compile time, so we can mark this as `constant`, which will also optimize our gas usage
    uint256 private constant MINIMUM_USD = 50 * 10**18;

    /**
     * Whenever we have these global variables i.e. uint256 favoriteNumber;
     * These are stuck in storage. Each slot is 32 bytes long, and represents the bytes version of the object
     * Storage is a giant array/list of all variables we create, and associated with this contract. Every single variable/value is slotted into
     * a 32 bytes-long slot. Every time another global variable is created, it takes up another storage slot.
     *
     * A dynamic value like mappings or dynamic arrays are stored using a hashing function.
     * For arrays, a sequential storage spot is taken up for the length of the array. For mappings, a sequential sotrage
     * spot is taken up, but left blank.
     * To take a concrete example of this, if we create an array, only the array's length is stored in storage. If we place a value within this array,
     * the hashing function (keccak256) is called to get the location of where the aforementioned value should be held in storage. If think about this
     * from a fundamental CS perspective, this makes sense as we do NOT want to store each value in adjacent entries to the array's length in storage.
     * For mappings, a sequential storage spot is taken up, but is blank. For more information, check out:
     * https://docs.soliditylang.org/en/v0.8.17/internals/layout_in_storage.html#mappings-and-dynamic-arrays
     *
     *
     * Constant variables are part of the contract's bytecode, and is not stored in strage; it's just a pointer to a value
     * Memory variables are deleted after the function has finished running.
     *
     * Anytime we read or write to or form storage, we spend a ton of gas. We can see this when using opcodes.
     * Gas is calculated using opcodes, and to learn more, check out https://github.com/crytic/evm-opcodes
     * Prepend "s_" to show that a variable is storage variable
     */

    AggregatorV3Interface private s_priceFeed;

    /**
     * A modifier is a keyword to modify a function definition.
     */
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        /**
         *  The underscore indicates we should continue with the rest of our code.
         * Order matters here, this means any require statements or "if" statements should occur before.
         * We do not want to call the rest of our code, only for the if and require checks to start and revert all the work our code already did.
         */
        _;
    }

    /**
     * `fallback` and `receive` are two special functions
     * A given contract can have at most one `receive` function without the `function` keyword.
     * It can't have args, can't return anything, and msust be external and payable. However, it can be virtual and have modifiers
     *
     * The point of receive
     */

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice funds the contract
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    /**
     * @notice withdraws from the contract, but only the owner can withdraw
     */
    function withdraw() public onlyOwner {
        /**
         * This reads and writes to storage frequently. Every single time, we keep doing a
         * comparison with what is in storage, which is expensive.
         */
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        /**
         * For more info, look at https://solidity-by-example.org/sending-ether
         * There are some issues with using transfer.
         * transfer throws an error. Meaning if we try to transfer and we fail, it'll throw an error AND revert.
         * send returns a bool. Meaning if we try to send and we fail, we'll only get a boolean. We will NOT revert.
         * call returns 2 variables; a boolean and a bytes object. Call is a lower level command, and we can use it to call any function.
         *
         * Here are a few examples
         * transfer --> payable(msg.sender).transfer(address(this).balance)
         * send     --> payable(msg.sender).send(address(this).balance)
         * call     --> payable(msg.sender).call{value: adddress(this).balance}("")
         *
         * If transfer fails, it will automatically revert.
         * If send fails, we wouldn't revert the txn, so we want to add a require statement so that we revert.
         * If call returns a value, its stored in the bytes object, which is an array. If it fails, we need to use require as well to revert successfully
         */
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function gasOptimizedWithdraw() public payable onlyOwner {
        // Memory is much cheaper, but keep in mind that mappings can't be in memory
        address[] memory funders = s_funders;

        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
