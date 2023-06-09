import { useEffect, useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { ArrowSmallRightIcon, NoSymbolIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { BigNumber } from "ethers";
import { useAccount, useContractWrite } from "wagmi";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

export const ContractInteraction = () => {

  const startTime = Math.floor(Date.now() / 1000);
  const [userNftContractAddress, setUserNftContractAddress] = useState("");
  const [nftTokenId, setNftTokenId] = useState(0);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [paymentTime, setPaymentTime] = useState(0);
  const [requestId, setRequestId] = useState(0);
  const [cancelRequestId, setCancelRequestId] = useState(0);
  const [lendRequestId, setLendRequestId] = useState(0);
  const [valueToLend, setValueToLend] = useState("");
  const [lendBorrowId, setLendBorrowId] = useState(0);
  const [liqudiateBorrowId, setLiqudiateBorrowId] = useState(0);
  const [paybackBorrowId, setPaybackBorrowId] = useState(0);
  const [valueToPayback, setValueToPayback] = useState("");
  const [date, setDate] = useState(startTime);
  const [tokenId, setTokenId] = useState(0);
  const [personBorrowIds, setPersonBorrowIds] = useState([]);
  const [personRequestIds, setPersonRequestIds] = useState([]);
  const { address, isConnected } = useAccount();
  const NFTLendingBorrowingContractInfo = useDeployedContractInfo("NFTLendingBorrowing");
  const NFTContractInfo = useDeployedContractInfo("NFT");
  const NFTLendingBorrowingContractAddress = NFTLendingBorrowingContractInfo?.data?.address;
  const NFTContractAddress = NFTContractInfo?.data?.address;

  const wrapSetPaybackId = (id: any) => {
    setPaybackBorrowId(id);
    let newDate = Math.floor(Date.now() / 1000) + 90;
    setDate(newDate);
  }

  const shortenAddress = () => {
    const prefixLength = 4;
    const suffixLength = 2;
    const prefix = NFTContractAddress?.slice(0, prefixLength);
    const suffix = NFTContractAddress?.slice(-suffixLength);
    return `${prefix}...${suffix}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(NFTContractAddress?.toString() || "");
    console.log(`Copied address: ${address}`);
  };


  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "requests",
    args: [BigNumber.from(lendRequestId || 0)],
    onSuccess(data: any) {
      console.log(data.requestedAmount.toString());
      setValueToLend(data.requestedAmount.div(BigNumber.from(10).pow(18)).toString());
    },
  });


  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "amountToPayAt",
    args: [BigNumber.from(paybackBorrowId), BigNumber.from(date)],
    onSuccess(data: any) {
      console.log(data.toString());
      setValueToPayback((Number(data.toString()) / 10 ** 18).toString());
    },

  });

  const { isLoading: borrowisLoading } = useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "getUserBorrowIds",
    args: [
      address
    ],
    onSuccess(personBorrowIds: any) {
      console.log("Person Borrow Ids", personBorrowIds)
      setPersonBorrowIds(personBorrowIds.map((id: any) => id.toString()));
    },
  });


  const { isLoading: requestisLoading } = useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "getUserRequestIds",
    args: [
      address
    ],
    onSuccess(personRequestIds: any) {
      console.log("Person Request Ids", personRequestIds)
      setPersonRequestIds(personRequestIds.map((id: any) => id.toString()));
    },
  });


  useScaffoldEventSubscriber({
    contractName: "NFTLendingBorrowing",
    eventName: "RequestCreated",
    listener: (
      requestId: any,
      nftContractAddress: string,
      borrower: string,
      requestedAmount: BigNumber,
      paymentTime: BigNumber,
      createdAt: BigNumber,
    ) => {
      setRequestId(requestId.toString());
    }
  });



  useScaffoldEventSubscriber({
    contractName: "NFTLendingBorrowing",
    eventName: "RequestLent",
    listener: (
      borrowsId: any,
      requestId: any,
      lender: string,
      lentAt: BigNumber,
    ) => {
      setLendBorrowId(borrowsId.toString());
    }
  });


  useScaffoldEventSubscriber({
    contractName: "NFT",
    eventName: "nftMinted",
    listener: (
      tokenId: any,
    ) => {
      setTokenId(tokenId.toString());
    }
  });


  const { data: createData, writeAsync: createBorrowRequest, isLoading: createisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "createBorrowRequest",
    args: [
      userNftContractAddress,
      BigNumber.from(nftTokenId || 0),
      BigNumber.from(requestedAmount * 1000 || 0).mul(BigNumber.from(10).pow(18).div(1000)),
      BigNumber.from(paymentTime || 0).mul(BigNumber.from(60).pow(2).mul(24)),
    ]
  });


  useEffect(() => {
    const fetchRequestId = async () => {
      const receipt = await createData?.wait();
      console.log(receipt);
    }
    if (createData) {
      fetchRequestId();
    }
  }, [createData]);


  const { writeAsync: cancelBorrowRequest, isLoading: cancelisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "cancelBorrowRequest",
    args: [
      BigNumber.from(cancelRequestId),
    ]
  });


  const { writeAsync: lendBorrowRequest, isLoading: lendisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "lend",
    args: [
      BigNumber.from(lendRequestId),
    ],
    value: valueToLend,
  });


  const { writeAsync: liquidateBorrowRequest, isLoading: liquidateisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "liquidate",
    args: [
      BigNumber.from(liqudiateBorrowId),
    ]
  });


  const { writeAsync: paybackBorrowRequest, isLoading: paybackisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "payback",
    args: [
      BigNumber.from(paybackBorrowId),
    ],
    value: valueToPayback,
  });


  const { writeAsync: mintNFT, isLoading: mintisLoading } = useScaffoldContractWrite({
    contractName: "NFT",
    functionName: "mint",
  })


  const { writeAsync: approveNFT, isLoading: approveisLoading } = useScaffoldContractWrite({
    contractName: "NFT",
    functionName: "setApprovalForAll",
    args: [
      NFTLendingBorrowingContractAddress,
      true,
    ],
  })


  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute top-48 right-20" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />

      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="flex flex-row items-center justify-around gap-8">
          <div className="flex-1 flex-none w-72 h-40 flex-col bg-base-200 mt-6 items-start opacity-80 items-center rounded-2xl shadow-lg border-2 border-primary px-4 py-3">
            <div className="flex flex-row items-center justify-around">
              <div className="flex flex-col items-center justify-around">
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">Claim NFT</h1>

                <button className="btn btn-primary rounded-full capitalize font-bold text-white w-48 flex items-center justify-center gap-1 hover:gap-2 transition-all loading:$mintisLoading$"
                  onClick={mintNFT}>
                  {!mintisLoading && "Mint Test NFT"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center"> 
            <div className="mt-3 flex gap-2 items-start">
              {tokenId ? (
                <div className="flex flex-col gap-1">
                  <span className="text-1xl font-bai-jamjuree text-black">NFT Token ID: {tokenId}</span>
                </div>
              ) : (<></>)}
            </div>
            <div className="mt-2 flex gap-2 items-start">
              {tokenId ? (
                <div className="flex flex-col gap-1">
                  <span className="text-1xl font-bai-jamjuree text-black cursor-pointer mx-auto" onClick={handleCopyAddress}>NFT Contract Address: {shortenAddress()}</span>
                  <span className="text-1xl font-bai-jamjuree text-black cursor-pointer mx-auto" onClick={handleCopyAddress}>(click to copy)</span>
                </div>
              ) : (<></>)}
            </div>
            </div>
          </div>
          <div className="flex-1 flex-none w-72 h-40 flex-col bg-base-200 mt-6 items-start opacity-80 items-center rounded-2xl shadow-lg border-2 border-primary px-4 py-3">
            <div className="flex flex-row justify-around">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4"> Approve Contract </h1>
                <button className="btn btn-primary rounded-full capitalize font-bold text-white w-58 flex items-center justify-center gap-1 hover:gap-2 transition-all loading:$approveisLoading$"
                  onClick={approveNFT}>
                  {!approveisLoading && "Approve"}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 flex-none w-72 h-40 flex-col bg-base-200 mt-6 items-start opacity-80 items-center rounded-2xl shadow-lg border-2 border-primary px-4 py-3">
            <div className="flex flex-row justify-around">
              <div >
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">Your Borrow ID's </h2>
                <div className="flex flex-row gap-1">
                  {personBorrowIds.length > 0 && personBorrowIds.map((id: any) => (
                    <span key={id} className="text-2xl font-bai-jamjuree text-black">{id}, </span>
                  ))}
                  {personBorrowIds.length === 0 && (
                    <span className="text-lg font-bai-jamjuree text-gray-500">No borrow ID's found.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex-none w-72 h-40 flex-col bg-base-200 mt-6 items-start opacity-80 items-center rounded-2xl shadow-lg border-2 border-primary px-4 py-3">
            <div className="flex flex-col  justify-around">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">Your Request ID's</h2>
              <div className="flex flex-row gap-1">
                {personRequestIds.length > 0 && personRequestIds.map((id: any) => (
                  <span key={id} className="text-2xl font-bai-jamjuree text-black">{id}, </span>
                ))}
                {personRequestIds.length === 0 && (
                  <span className="text-lg font-bai-jamjuree text-gray-500">No request ID's found.</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-around gap-16">
          <div className="flex-none flex-col w-60 mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary w-full md:w-auto">
            <div className="flex flex-wrap items-center justify-around">
              <span className="text-3xl sm:text-3xl font-bold text-black">Create A New Borrow Request</span>
            </div>
            <div className="flex flex-wrap items-center justify-around gap-8">

              <div className="flex-none flex-col justify-around">
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                  <input
                    type="text"
                    placeholder="NFT Contract Address"
                    className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                    onChange={e => setUserNftContractAddress(e.target.value)}
                  />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                  <input
                    type="number"
                    placeholder="NFT Token ID"
                    className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                    onChange={e => setNftTokenId(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex-none flex-col justify-around">
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                  <input
                    type="number"
                    min="1"
                    placeholder="Requested Amount (only Integer)"
                    className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                    onChange={e => setRequestedAmount(Number(e.target.value))}
                  />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                  <input
                    type="number"
                    min="1"
                    placeholder="Payment Time (only Integer)"
                    className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                    onChange={e => setPaymentTime(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
              <div className="flex flex-wrap items-center justify-center">                
              <div className="flex rounded-full p-1">
                  <button
                    className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${createisLoading ? "loading" : ""
                      }`}
                    onClick={createBorrowRequest}
                  >
                    {!createisLoading && (
                      <>
                        Create
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center"> 
              <div className="mt-1 flex gap-2 items-start">
                {requestId ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bai-jamjuree text-black">Request ID: {requestId}</span>
                  </div>
                ) : (<></>)}
              </div>
              </div>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex-1 h-64 w-64 flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
            <div className="flex flex-wrap items-center justify-around">
              <span className="text-3xl sm:text-3xl font-bold text-black">Cancel A Borrow Request</span>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <input
                type="number"
                placeholder="Request ID To Cancel"
                className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                onChange={e => setCancelRequestId(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-wrap items-center justify-around rounded-full p-1 flex-shrink-0">
              <div className="flex rounded-full  p-1">
                <button
                  className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${cancelisLoading ? "loading" : ""
                    }`}
                  onClick={cancelBorrowRequest}
                >
                  {!cancelisLoading && (
                    <>
                      Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 h-64 w-64 flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
            <div className="flex flex-wrap items-center justify-around">
              <span className="text-3xl sm:text-3xl font-bold text-black">Lend A Borrow Request</span>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <input
                type="number"
                placeholder="Request ID to Lend"
                className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                onChange={e => setLendRequestId(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-wrap items-center justify-around rounded-full p-1 flex-shrink-0">
              <div className="flex rounded-full  p-1">
                <button
                  className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${lendisLoading ? "loading" : ""
                    }`}
                  onClick={lendBorrowRequest}
                >
                  {!lendisLoading && (
                    <>
                      Lend
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-2 items-start">
              {lendBorrowId ? (
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bai-jamjuree text-black">Borrows ID</span>
                  <span className="text-2xl font-bai-jamjuree text-black">{lendBorrowId}</span>
                </div>
              ) : (<></>)}
            </div>
          </div>
          <div className="flex-1 h-64 w-64 flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
            <div className="flex flex-wrap items-center justify-around">
              <span className="text-3xl sm:text-3xl font-bold text-black">Liqudiate A Borrow Request</span>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <input
                type="number"
                placeholder="Borrow ID to Liquidate"
                className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                onChange={e => setLiqudiateBorrowId(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-wrap items-center justify-around rounded-full p-1 flex-shrink-0">            <div className="flex rounded-full  p-1">
              <button
                className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${liquidateisLoading ? "loading" : ""
                  }`}
                onClick={liquidateBorrowRequest}
              >
                {!liquidateisLoading && (
                  <>
                    Liq
                  </>
                )}
              </button>
            </div>
            </div>
          </div>

          <div className="flex-1 h-64 w-64 flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
            <div className="flex flex-wrap items-center justify-around">
              <span className="text-3xl sm:text-3xl font-bold text-black">Payback A Borrow Request</span>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <input
                type="number"
                placeholder="Borrow ID to Payback"
                className="input font-bai-jamjuree w-full px-5 bg-blue-900 bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white text-white uppercase"
                onChange={e => wrapSetPaybackId(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-wrap items-center justify-around rounded-full p-1 flex-shrink-0">
              <div className="flex rounded-full  p-1">
                <button
                  className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${paybackisLoading ? "loading" : ""
                    }`}
                  onClick={paybackBorrowRequest}
                >
                  {!paybackisLoading && (
                    <>
                      PayBack
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  );
};
