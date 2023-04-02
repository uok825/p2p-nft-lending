import { useEffect, useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { ArrowSmallRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { BigNumber } from "ethers";
import { useContractWrite } from "wagmi";
// APPROVE BUTONU EKLE
export const ContractInteraction = () => {

  const startTime = Math.floor(Date.now() / 1000);

  const [nftContractAddress, setNftContractAddress] = useState("");
  const [nftTokenId, setNftTokenId] = useState(0);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [paymentTime, setPaymentTime] = useState(0);
  const [requestId, setRequestId] = useState(0);
  const [lendRequestId, setLendRequestId] = useState(0);
  const [valueToLend, setValueToLend] = useState("");
  const [lendBorrowId, setLendBorrowId] = useState(0);
  const [liqudiateBorrowId, setLiqudiateBorrowId] = useState(0);
  const [paybackBorrowId, setPaybackBorrowId] = useState(0);
  const [valueToPayback, setValueToPayback] = useState("");
  const [date, setDate] = useState(startTime);
  const [tokenId, setTokenId] = useState(0);

  const wrapSetPaybackId = (id: any) => {
    setPaybackBorrowId(id);
    let newDate = Math.floor(Date.now() / 1000) + 90;
    setDate(newDate);
  }

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
      setValueToPayback((Number(data.toString()) / 10**18).toString());
    },

  });

  useScaffoldEventSubscriber({
    contractName: "NFTLendingBorrowing",
    eventName: "RequestCreated",
    listener: (
      requestId: any,
      ...args: any[]
    ) => {
      setRequestId(requestId.toString());
    }
  });


  useScaffoldEventSubscriber({
    contractName: "NFTLendingBorrowing",
    eventName: "RequestLent",
    listener: (
      borrowsId: any,
      ...args: any[]
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

  const { data: createData, writeAsync: createBorrowRequest, isLoading:  createisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "createBorrowRequest",
    args: [
      nftContractAddress,
      BigNumber.from(nftTokenId || 0),
      BigNumber.from(requestedAmount || 0).mul(BigNumber.from(10).pow(18)),
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
      BigNumber.from(requestId),
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
  

  const  { writeAsync: mintNFT, isLoading: mintisLoading} = useScaffoldContractWrite({
    contractName: "NFT",
    functionName: "mint",
  })


  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
      <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <div className="">
          <span className="text-4xl sm:text-3xl text-black">Mint Your Test NFT</span>
              <button
                className={`btn btn-primary rounded-full capitalize font-bold font-white mt-8 w-48 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${mintisLoading ? "loading" : ""
                  }`}
                onClick={mintNFT}
              >
                {!mintisLoading && (
                  <>
                    Mint Your Test NFT
                  </>
                )}
              </button>
            </div>
            <div className="mt-4 flex gap-2 items-start">
            {tokenId ? (
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bai-jamjuree text-black">Your NFT Token ID</span>
                <span className="text-2xl font-bai-jamjuree text-black">{tokenId}</span>
              </div>
            ) : (<></>)}
          </div>
          </div>

        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">

          <span className="text-4xl sm:text-6xl text-black">Create A New Borrow Request</span>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="text"
              placeholder="NFT Contract Address"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setNftContractAddress(e.target.value)}
            />
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="NFT Token ID"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setNftTokenId(Number(e.target.value))}
            />
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="Requested Amount"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setRequestedAmount(Number(e.target.value))}
            />
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="Payment Time"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setPaymentTime(Number(e.target.value))}
            />
          </div>
          <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
            <div className="flex rounded-full border-2 border-primary p-1">
              <button
                className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${createisLoading ? "loading" : ""
                  }`}
                onClick={createBorrowRequest}
              >
                {!createisLoading && (
                  <>
                    Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 items-start">
            {requestId ? (
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bai-jamjuree text-white">Request ID</span>
                <span className="text-2xl font-bai-jamjuree text-white">{requestId}</span>
              </div>
            ) : (<></>)}
          </div>
        </div>


        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Cancel A Borrow Request</span>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="Your Request ID"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setRequestId(Number(e.target.value))}
            />
          </div>
          <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
            <div className="flex rounded-full border-2 border-primary p-1">
              <button
                className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${cancelisLoading ? "loading" : ""
                  }`}
                onClick={cancelBorrowRequest}
              >
                {!cancelisLoading && (
                  <>
                    Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Lend A Borrow Request</span>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="Request ID to Lend"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setLendRequestId(Number(e.target.value))}
            />
          </div>
          <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
            <div className="flex rounded-full border-2 border-primary p-1">
              <button
                className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${lendisLoading ? "loading" : ""
                  }`}
                onClick={lendBorrowRequest}
              >
                {!lendisLoading && (
                  <>
                    Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 items-start">
            {lendBorrowId ? (
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bai-jamjuree text-white">Borrows ID</span>
                <span className="text-2xl font-bai-jamjuree text-white">{lendBorrowId}</span>
              </div>
            ) : (<></>)}
          </div>
        </div>
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Liqudiate A Borrow Request</span>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="Borrow ID to Liquidate"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => setLiqudiateBorrowId(Number(e.target.value))}
            />
          </div>
          <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
            <div className="flex rounded-full border-2 border-primary p-1">
              <button
                className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${liquidateisLoading ? "loading" : ""
                  }`}
                onClick={liquidateBorrowRequest}
              >
                {!liquidateisLoading && (
                  <>
                    Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Payback A Borrow Request</span>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <input
              type="number"
              placeholder="Borrow ID to Payback"
              className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white uppercase"
              onChange={e => wrapSetPaybackId(Number(e.target.value))}
            />
          </div>
          <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
            <div className="flex rounded-full border-2 border-primary p-1">
              <button
                className={`btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${paybackisLoading ? "loading" : ""
                  }`}
                onClick={paybackBorrowRequest}
              >
                {!paybackisLoading && (
                  <>
                    Send <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>


  );
};