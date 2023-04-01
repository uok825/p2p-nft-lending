// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
/**
 * @author Utku
 */
 // TO TEST THE CONTRACT I INHERITED ERC721
contract NFTLendingBorrowing is ReentrancyGuard { // BorLen = Borrow and Lend


    // Struct & State Variables //

    struct Request {
        address nftContract;
        address borrower;
        uint256 nftTokenId;
        uint256 requestedAmount;
        uint256 paymentTime;
        uint256 createdAt;
        bool isValid;
        bool isLended;
    }
    struct Borrow {
        uint256 requestID;
        uint256 lendedAt;
        address lender;
        bool isLiquidated;
        bool isPaid;
    }
    Request[] public requests;
    Borrow[] public borrows;
    uint256 lastRequestId = 0;
    uint256 lastBorrowsId = 0;
    uint256 public dailyInterestRate = 1; // 1% daily interest rate

    // Events //
    // FIX: her şeyi event yapmaya gerek yok mesela requestLendedda requestId ve lender detayları vermen lazım.

    event RequestCreated(
        address nftContract,
        address indexed borrower,
        uint256 nftTokenId,
        uint256 indexed requestedAmount,
        uint256 paymentTime
    );
    event RequestCancelled(
        uint256 indexed requestId
    );
    event RequestLended(
        uint256 indexed requestId,
        address indexed lender,
        uint256 lendedAt
    );
    event BorrowLiquidated(
        uint256 indexed borrowId,
        address indexed liquidator,
        uint256 liquidatedAt
    );

    constructor() {}

    // Functions //

    // Creating and Removing Request

    function createBorrowRequest(
        address _nftContract,
        uint256 _nftTokenId,
        uint256 _requestedAmount,
        uint256 _paymentTime
    ) public {
        require(_nftContract != address(0), "NFT contract address cannot be 0");
        require(_paymentTime > 0, "Deadline needs to be in the future");
        require(_requestedAmount > 0, "Requested amount cannot be 0");

        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_nftTokenId) == msg.sender, "You are not the owner of this NFT");
        require(nft.isApprovedForAll(msg.sender, address(this)), "You need to approve this contract to transfer your NFT");

        Request memory newRequest = Request({
            nftContract: _nftContract,
            borrower: msg.sender,
            nftTokenId: _nftTokenId,
            requestedAmount: _requestedAmount,
            paymentTime: _paymentTime,
            createdAt: block.timestamp,
            isValid: true,
            isLended: false
        });
        requests.push(newRequest);
        lastRequestId++;

        emit RequestCreated(_nftContract, msg.sender, _nftTokenId, _requestedAmount, _paymentTime);
    }

    function cancelBorrowRequest(uint256 _requestId) public {
        require(_requestId < lastRequestId, "Request ID is not valid");
        Request storage req = requests[_requestId];
        require(req.borrower == msg.sender, "You are not the owner of this request");
        req.isValid = false;

        emit RequestCancelled(
            _requestId
        );
    }

    // Lend a request

    function lend(uint256 _requestId) public payable nonReentrant {
        require(_requestId < lastRequestId, "Request ID is not valid");

        Request storage req = requests[_requestId];
        require(!req.isLended, "Request is already lended");
        require(req.isValid, "Request is not valid");
        require(msg.value == req.requestedAmount, "You need to send exact amount of ETH");

        Borrow memory newBorrow = Borrow({
            requestID: _requestId,
            lendedAt: block.timestamp,
            lender: msg.sender,
            isLiquidated: false,
            isPaid: false
        });
        borrows.push(newBorrow);
        lastBorrowsId++;
        
        IERC721 nft = IERC721(req.nftContract);
        nft.transferFrom(req.borrower, address(this), req.nftTokenId);

        (bool success, ) = req.borrower.call{value: msg.value}("");
        require(success, "Transfer failed.");

        req.isLended = true;

        emit RequestLended(
            _requestId,
            msg.sender,
            block.timestamp
        );
    }
    // Liquidate a request
    function liquidate(uint256 _borrowId) public {
        Borrow storage borrow = borrows[_borrowId];
        require(borrow.lendedAt != 0, "Borrow is not exists");
        require(!borrow.isLiquidated, "Borrow is already liquidated");
        require(!borrow.isPaid, "Borrow is already paid");

        Request storage req = requests[borrow.requestID];
        require(borrow.lendedAt + req.paymentTime < block.timestamp, "Deadline is not passed");
        
        IERC721 nft = IERC721(req.nftContract);
        nft.transferFrom(address(this), borrow.lender , req.nftTokenId);

        borrow.isLiquidated = true;
        req.isValid = false;

        emit BorrowLiquidated(
            _borrowId,
            msg.sender,
            block.timestamp
        );
    }
    // Payback a request
    function payback(uint256 _borrowId) public payable nonReentrant {
        Borrow storage borrow = borrows[_borrowId];
        Request storage req = requests[borrow.requestID];
        
        uint256 total = amountToPay(_borrowId);
        require(msg.value >= total, "You need to send exact amount of ETH");

        require(borrow.lendedAt != 0, "Borrow ID is not valid");
        require(!borrow.isPaid, "This request is already paid");
        require(!borrow.isLiquidated, "This request is already liquidated");
        
        require(req.isValid, "This request is not valid");

        // transfer nft
        IERC721 nft = IERC721(req.nftContract);
        nft.transferFrom(address(this), req.borrower, req.nftTokenId);

        // payback total
        (bool success, ) = borrow.lender.call{value: total}("");
        require(success, "Transfer failed.");

        // refund
        (bool success2, ) = msg.sender.call{value: msg.value - total}("");
        require(success2, "Transfer failed.");

        // invalidate request
        borrow.isPaid = true;
        req.isValid = false;
    }

    // get interest rate
    function amountToPay(uint256 _borrowId) public view returns (uint256) {
        Borrow memory borrow = borrows[_borrowId];
        Request memory req = requests[borrow.requestID];
        uint256 secondPassed = block.timestamp - borrow.lendedAt;
        uint256 interest = secondPassed * req.requestedAmount * dailyInterestRate / 100 / 86400;
        return req.requestedAmount + interest;
    }

    function amountToPayAt(uint256 _borrowId, uint256 _timestamp) public view returns (uint256) {
        Borrow memory borrow = borrows[_borrowId];
        Request memory req = requests[borrow.requestID];
        uint256 secondPassed = _timestamp - borrow.lendedAt;
        uint256 interest = secondPassed * req.requestedAmount * dailyInterestRate / 100 / 86400;
        return req.requestedAmount + interest;
    }
}