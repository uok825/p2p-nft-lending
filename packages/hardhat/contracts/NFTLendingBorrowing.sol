// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @author uok825 / utkuomer.eth
 */

contract NFTLendingBorrowing is ReentrancyGuard {


    // Structs, States and Mappings //

    struct Request {
        uint256 requestId;
        address nftContract;
        address borrower;
        uint256 nftTokenId;
        uint256 requestedAmount;
        uint256 paymentTime;
        uint256 createdAt;
        bool isValid;
        bool isLent;
    }

    struct Borrow {
        uint256 requestID;
        uint256 lentAt;
        address lender;
        bool isLiquidated;
        bool isPaid;
    }

    Request[] public requests;
    Borrow[] public borrows;

    mapping(address => mapping(uint256 => uint256)) public addressToRequestIds;
    mapping(address => mapping(uint256 => uint256)) public addressToBorrowIds;

    mapping(address => uint256) public addressToRequestCount;
    mapping(address => uint256) public addressToBorrowCount;

    // addressToRequestCount[msg.sender] = 3;
    // addressToRequestIds[msg.sender][0] -> 120
    // addressToRequestIds[msg.sender][1] -> 121
    // addressToRequestIds[msg.sender][2] -> 132

    uint256 lastRequestId = 0;
    uint256 lastBorrowsId = 0;

    uint256 public dailyInterestRate = 1; // 1% daily interest rate

    // Events //

    event RequestCreated(
        uint256 indexed requestId,
        address nftContract,
        address indexed borrower,
        uint256 nftTokenId,
        uint256 indexed requestedAmount,
        uint256 paymentTime
    );

    event RequestCancelled(
        uint256 indexed requestId
    );

    event RequestLent(
        uint256 borrowsId,
        uint256 indexed requestId,
        address indexed lender,
        uint256 lentAt
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
            requestId: lastRequestId,
            nftContract: _nftContract,
            borrower: msg.sender,
            nftTokenId: _nftTokenId,
            requestedAmount: _requestedAmount,
            paymentTime: _paymentTime,
            createdAt: block.timestamp,
            isValid: true,
            isLent: false
        });
        requests.push(newRequest);

        uint256 userRequestCount = addressToRequestCount[msg.sender];

        addressToRequestIds[msg.sender][userRequestCount] = lastRequestId;
        addressToRequestCount[msg.sender]++;

        emit RequestCreated(lastRequestId, _nftContract, msg.sender, _nftTokenId, _requestedAmount, _paymentTime);
        
        lastRequestId++;
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
        require(!req.isLent, "Request is already lent");
        require(req.isValid, "Request is not valid");
        require(msg.value == req.requestedAmount, "You need to send exact amount of ETH");

        Borrow memory newBorrow = Borrow({
            requestID: _requestId,
            lentAt: block.timestamp,
            lender: msg.sender,
            isLiquidated: false,
            isPaid: false
        });
        borrows.push(newBorrow);

        uint256 userBorrowCount = addressToBorrowCount[msg.sender];
        addressToBorrowIds[msg.sender][userBorrowCount] = lastBorrowsId;

        addressToBorrowCount[msg.sender]++;

        IERC721 nft = IERC721(req.nftContract);
        nft.transferFrom(req.borrower, address(this), req.nftTokenId);

        (bool success, ) = req.borrower.call{value: msg.value}("");
        require(success, "Transfer failed.");

        req.isLent = true;

        emit RequestLent(
            lastBorrowsId,
            _requestId,
            msg.sender,
            block.timestamp
        );
        lastBorrowsId++;
    }

    // Liquidate a request

    function liquidate(uint256 _borrowId) public {
        Borrow storage borrow = borrows[_borrowId];
        require(borrow.lentAt != 0, "Borrow is not exists");
        require(!borrow.isLiquidated, "Borrow is already liquidated");
        require(!borrow.isPaid, "Borrow is already paid");

        Request storage req = requests[borrow.requestID];
        require(borrow.lentAt + req.paymentTime < block.timestamp, "Deadline is not passed");
        
        IERC721 nft = IERC721(req.nftContract);
        nft.transferFrom(address(this), borrow.lender , req.nftTokenId);

        borrow.isLiquidated = true;
        req.isValid = false;
        req.isLent = false;

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

        require(borrow.lentAt != 0, "Borrow ID is not valid");
        require(!borrow.isPaid, "This request is already paid");
        require(!borrow.isLiquidated, "This request is already liquidated");
        
        require(req.isValid, "This request is not valid");

        IERC721 nft = IERC721(req.nftContract);
        nft.transferFrom(address(this), req.borrower, req.nftTokenId);


        (bool success, ) = borrow.lender.call{value: total}("");
        require(success, "Transfer failed.");

        (bool success2, ) = msg.sender.call{value: msg.value - total}("");
        require(success2, "Transfer failed.");


        borrow.isPaid = true;
        req.isValid = false;
        req.isLent = false;
    }
    

    function amountToPay(uint256 _borrowId) public view returns (uint256) {
        Borrow memory borrow = borrows[_borrowId];
        Request memory req = requests[borrow.requestID];

        uint256 secondPassed = block.timestamp - borrow.lentAt;
        uint256 interest = secondPassed * req.requestedAmount * dailyInterestRate / 100 / 86400;
        
        return req.requestedAmount + interest;
    }

    function amountToPayAt(uint256 _borrowId, uint256 _timestamp) public view returns (uint256) {
        Borrow memory borrow = borrows[_borrowId];
        Request memory req = requests[borrow.requestID];
    
        uint256 secondPassed = _timestamp - borrow.lentAt;
        uint256 interest = secondPassed * req.requestedAmount * dailyInterestRate / 100 / 86400;
        
        return req.requestedAmount + interest;
    }


    function getUserRequestCount(address _user) public view returns (uint256) {
        return addressToRequestCount[_user];
    }
    function getUserBorrowCount(address _user) public view returns (uint256) {
        return addressToBorrowCount[_user];
    }


    function getUserRequestIds(address _user) public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](addressToRequestCount[_user]);
        for (uint256 i = 0; i < addressToRequestCount[_user]; i++) {
            ids[i] = addressToRequestIds[_user][i];
        }
        return ids;
    }
    function getUserBorrowIds(address _user) public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](addressToBorrowCount[_user]);
        for (uint256 i = 0; i < addressToBorrowCount[_user]; i++) {
            ids[i] = addressToBorrowIds[_user][i];
        }
        return ids;
    }
    function getRequestDetails() public view returns (Request[] memory) {
        Request[] memory requestDetails = new Request[](lastRequestId);
        for (uint256 i = 0; i < lastRequestId; i++) {
            requestDetails[i] = requests[i];
        }
        return requestDetails;
    }
        function getBorrowDetails() public view returns (Borrow[] memory) {
        Borrow[] memory borrowDetails = new Borrow[](lastBorrowsId);
        for (uint256 i = 0; i < lastBorrowsId; i++) {
            borrowDetails[i] = borrows[i];
        }
        return borrowDetails;
    }
}