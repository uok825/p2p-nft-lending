// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "../node_modules/hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
/**
 * @author Utku
 */
 // TO TEST THE CONTRACT I INHERITED ERC721
contract NFTLendingBorrowing { // BorLen = Borrow and Lend


    // Struct & State Variables //

    struct Request {
        address nftContract;
        address borrower;
        uint256 nftTokenId;
        uint256 requestedAmount;
        uint256 deadline;
        bool isValid;
        bool isLended;
    }
    struct Borrows {
        uint256 requestID;
        uint256 lendedAt;
        address lender;
        bool isLiquidated;
        bool isPaid;
    }
    Request[] public request;
    Borrows[] public borrows;
    uint256 lastRequestId = 0;
    uint256 lastBorrowsId = 0;
    uint256 public dailyInterestRate = 1; // 1% daily interest rate
    // Events //
    // FIX: her şeyi event yapmaya gerek yok mesela requestLendedda requestId ve lender detayları vermen lazım.
    // FIX: indexed ne öğren ve kullan.

    event RequestCreated(
        address nftContract,
        address indexed borrower,
        uint256 nftTokenId,
        uint256 indexed requestedAmount,
        uint256 deadline
    );
    event RequestCancelled(
        address nftContract,
        address indexed borrower,
        uint256 nftTokenId,
        uint256 requestedAmount,
        uint256 deadline
    );
    event RequestLended(
        address nftContract,
        address indexed borrower,
        address indexed lender,
        uint256 nftTokenId,
        uint256 requestId,
        uint256 indexed requestedAmount,
        uint256 deadline,
        uint256 lendedAt
    );
    // Constructor gerekli değil sanırım//

    // Functions //

    // Creating and Removing Request

    function createRequest(
        address _nftContract,
        uint256 _nftTokenId,
        uint256 _requestedAmount,
        uint256 _deadline
    ) public {
        require(_nftContract != address(0), "NFT contract address cannot be 0");
        IERC721 nft = IERC721(_nftContract);
        require(_deadline > block.timestamp, "Deadline needs to be in the future");
        require(_requestedAmount > 0, "Requested amount cannot be 0");
        require(nft.ownerOf(_nftTokenId) == msg.sender, "You are not the owner of this NFT");
        require(nft.isApprovedForAll(msg.sender, address(this)), "You need to approve this contract to transfer your NFT");
        console.log("Creating new request '%s' from %s", _nftContract, msg.sender);
        Request memory newRequest = Request({
            nftContract: _nftContract,
            borrower: msg.sender,
            nftTokenId: _nftTokenId,
            requestedAmount: _requestedAmount,
            deadline: _deadline,
            isValid: true,
            isLended: false
        });
            request.push(newRequest);
            lastRequestId++;
            emit RequestCreated(_nftContract, msg.sender, _nftTokenId, _requestedAmount, _deadline);
    }
    function cancelRequest(uint256 _requestId) public {
        require(_requestId < lastRequestId, "Request ID is not valid");
        require(request[_requestId].borrower == msg.sender, "You are not the owner of this request");
        require(request[_requestId].deadline > block.timestamp, "Deadline is passed");
        request[_requestId].isValid = false;
        emit RequestCancelled(request[_requestId].nftContract, request[_requestId].borrower, request[_requestId].nftTokenId, request[_requestId].requestedAmount, request[_requestId].deadline);
    }

    // Lend a request

    function lend(uint256 _requestId) public payable {
        require(_requestId < lastRequestId, "Request ID is not valid");
        require(request[_requestId].deadline > block.timestamp, "Deadline is passed");
        require(msg.value == request[_requestId].requestedAmount, "You need to send exact amount of ETH");
        require(request[_requestId].isValid == true, "Request is not valid");
        IERC721 nft = IERC721(request[_requestId].nftContract);
        Borrows memory newBorrow = Borrows({
            requestID: _requestId,
            lendedAt: block.timestamp,
            lender: msg.sender,
            isLiquidated: false,
            isPaid: false
        });
        borrows.push(newBorrow);
        lastBorrowsId++;
        // LendID derken? . [istersen içinde lendId de tut ikili bağlantı olsun.]
        nft.transferFrom(request[_requestId].borrower, address(this), request[_requestId].nftTokenId);
        (bool success, ) = request[_requestId].borrower.call{value: msg.value}("");
        require(success, "Transfer failed.");
        emit RequestLended(request[_requestId].nftContract, request[_requestId].borrower, msg.sender, request[_requestId].requestedAmount, request[_requestId].deadline, _requestId ,request[_requestId].nftTokenId, block.timestamp);
        request[_requestId].isLended = true;
    }
    // Liquidate a request
    function liquidate(uint256 _borrowsId) public {
        require(borrows[_borrowsId].lendedAt != 0, "Borrow ID is not valid");
        require(borrows[_borrowsId].isLiquidated == false, "Borrow is already liquidated");
        require(borrows[_borrowsId].lendedAt + request[borrows[_borrowsId].requestID].deadline < block.timestamp, "Deadline is not passed");
        //ya da lastBorrowsId'yi kullan kontrol için
            IERC721 nft = IERC721(request[borrows[_borrowsId].requestID].nftContract);
            nft.transferFrom(address(this), borrows[_borrowsId].lender , request[borrows[_borrowsId].requestID].nftTokenId);
            borrows[_borrowsId].isLiquidated = true;
            request[borrows[_borrowsId].requestID].isValid = false;
    }
    // Payback a request
    function payback(uint256 _borrowsId) public payable {
        uint256 secondPassed = block.timestamp - borrows[_borrowsId].lendedAt;
        uint256 interest = secondPassed * request[borrows[_borrowsId].requestID].requestedAmount * dailyInterestRate / 100 / 86400;
        uint256 total = interest + request[borrows[_borrowsId].requestID].requestedAmount;
        require(borrows[_borrowsId].lendedAt != 0, "Borrow ID is not valid");
        require(msg.value >= total, "You need to send exact amount of ETH");
        require(borrows[_borrowsId].isPaid == false, "This request is already paid");
        require(borrows[_borrowsId].isLiquidated == false, "This request is already liquidated");
        require(request[borrows[_borrowsId].requestID].isValid == true, "This request is not valid");

        // transfer nft
        IERC721 nft = IERC721(request[borrows[_borrowsId].requestID].nftContract);
        nft.transferFrom(address(this), request[borrows[_borrowsId].requestID].borrower, request[borrows[_borrowsId].requestID].nftTokenId);

        // payback total
        (bool success, ) = borrows[_borrowsId].lender.call{value: total}("");
        require(success, "Transfer failed.");

        // refund
        (bool success2, ) = msg.sender.call{value: msg.value - total}("");
        require(success2, "Transfer failed.");

        // invalidate request
        borrows[_borrowsId].isPaid = true;
        request[borrows[_borrowsId].requestID].isValid = false;
    }

    // get interest rate
    function amountToPay(uint256 _borrowId) public view returns (uint256) {
        uint256 secondPassed = block.timestamp - borrows[_borrowId].lendedAt;
        uint256 interest = secondPassed * request[borrows[_borrowId].requestID].requestedAmount * dailyInterestRate / 100 / 86400;
        return request[borrows[_borrowId].requestID].requestedAmount + interest;
    }

    function amountToPayAt(uint256 _borrowId, uint256 _timestamp) public view returns (uint256) {
        uint256 secondPassed = _timestamp - borrows[_borrowId].lendedAt;
        uint256 interest = secondPassed * request[borrows[_borrowId].requestID].requestedAmount * dailyInterestRate / 100 / 86400;
        return request[borrows[_borrowId].requestID].requestedAmount + interest;
    }
}