import { useEffect, useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { NoSymbolIcon, LinkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { BigNumber } from "ethers";
import { useAccount, useContractWrite } from "wagmi";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

export const ContractInteractionforRequest = () => {

  const [selectedRequestId, setSelectedRequestId] = useState(0);
  const [requestNftContractAddress, setRequestNftContractAddress] = useState([]);
  const [requestNftTokenId, setRequestNftTokenId] = useState([]);
  const [requestedAmount, setRequestedAmount] = useState([]);
  const [requestPaymentTime, setRequestPaymentTime] = useState([]);
  const [requestId, setRequestId] = useState([]);
  const [lendBorrowId, setLendBorrowId] = useState(0);
  const [valueToLend, setValueToLend] = useState([]);
  const { address, isConnected } = useAccount();
  const [isLent, setIsLent] = useState([]);
  const [isValid, setIsValid] = useState([]);
  const [isSet, setIsSet] = useState(false);
  const [isLiqudiated, setIsLiqudiated] = useState([]);
  const [isPaid, setIsPaid] = useState([]);
  const NFTLendingBorrowingContractInfo = useDeployedContractInfo("NFTLendingBorrowing");
  const NFTContractInfo = useDeployedContractInfo("NFT");
  const NFTLendingBorrowingContractAddress = NFTLendingBorrowingContractInfo?.data?.address;
  const NFTContractAddress = NFTContractInfo?.data?.address;

  const wrapSetLendId = (id: any) => {
    setSelectedRequestId(id);
  }


  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "requests",
    args: [BigNumber.from(selectedRequestId)],
    onSuccess(data: any) {
      setValueToLend(data.requestedAmount.div(BigNumber.from(10).pow(18)).toString());
    },
  });


  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "getRequestDetails",
    onSuccess(allRequestDetails: any) {
      setRequestId(allRequestDetails.map((getDetails: any) => getDetails.requestId.toString()) || []);
      setRequestedAmount(allRequestDetails.map((getDetails: any) => getDetails.requestedAmount.div(BigNumber.from(10).pow(18)).toString()) || []);
      setRequestPaymentTime(allRequestDetails.map((getDetails: any) => getDetails.paymentTime.div(BigNumber.from(60).pow(2).mul(24)).toString()) || []);
      setRequestNftContractAddress(allRequestDetails.map((getDetails: any) => getDetails.nftContract.toString()) || []);
      setRequestNftTokenId(allRequestDetails.map((getDetails: any) => getDetails.nftTokenId.toString()) || []);
      setIsValid(allRequestDetails.map((getDetails: any) => getDetails.isValid) || []);
      setIsLent(allRequestDetails.map((getDetails: any) => getDetails.isLent) || []); 
    },
  });
  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "getBorrowDetails",
    onSuccess(allBorrowDetails: any) {
      setIsLiqudiated(allBorrowDetails.map((getDetails: any) => getDetails.isLiqudiated) || []);
      setIsPaid(allBorrowDetails.map((getDetails: any) => getDetails.isPaid) || []); 
    },
  });


  const { writeAsync: lendRequest, isLoading: lendisLoading } = useScaffoldContractWrite({
    contractName: "NFTLendingBorrowing",
    functionName: "lend",
    args: [
      BigNumber.from(selectedRequestId),
    ],
    value: valueToLend.toString(),
  });

  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <DiamondIcon className="absolute bottom-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />

      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-4xl font-bold text-black">Requests</span>
          <div className="flex flex-wrap justify-around">
            {requestId.length > 0 &&
              requestId.map((id: any, index: number) => (
                <div
                  key={index}
                  className="flex-1 flex-none w-80 h-38 flex-row mt-6 items-start items-center rounded-2xl shadow-lg border-2 border-primary px-4 py-3"
                >
                  <div className={`request-status ${isValid[index] && !isLent[index] ? 'text-green-500 rounded-2xl shadow-lg border-2 border-primary border-green-500 bg-inherit px-1' : isLent[index] && !isPaid[index] ? 'text-blue-500 rounded-2xl shadow-lg border-2 border-blue-500 bg-inherit px-1' : isPaid[index] && !isLent[index] ? 'text-orange-600 rounded-2xl shadow-lg border-2 border-primary border-orange-600 bg-inherit px-1' : isLiqudiated[index] && !isLent[index] ? 'text-purple-700 rounded-2xl shadow-lg border-2 border-primary border-purple-700 bg-inherit px-1' : 'text-red-700 rounded-2xl shadow-lg border-2 border-primary border-red-700 bg-inherit px-1'}`} style={{ width: "80px", textAlign: "center" }}>
                    {isLent[index] && isValid[index] ? 'Lent' : isValid[index] && !isPaid[index] && !isLiqudiated[index] ? 'Active' : isPaid[index] && !isLent[index] ? 'Paid' : isLiqudiated[index] && !isLent[index] ? 'Liqudiated' : 'Cancelled'}
                  </div>

                  <div>
                    <span className="text-2xl font-bai-jamjuree text-black">Request ID: {id}</span>
                  </div>
                  {requestedAmount.length > index && (
                    <div>
                      <span className="text-2xl font-bai-jamjuree text-black">
                        Requested Amount: {requestedAmount[index]} ETH
                      </span>
                    </div>
                  )}
                  {requestPaymentTime.length > index && (
                    <div>
                      <span className="text-2xl font-bai-jamjuree text-black">
                        Payment Time: {requestPaymentTime[index]} Day
                      </span>
                    </div>
                  )}
                  {requestNftContractAddress.length > index && (
                    <div>
                      <a href={`https://etherscan.io/address/${requestNftContractAddress[index]}`} target="_blank" rel="noopener noreferrer">
                        <span className="text-2xl font-bai-jamjuree text-black">
                          NFT Contract: {requestNftContractAddress[index]?.substring(0, 12)}...
                        </span>
                      </a>
                    </div>
                  )}
                  {requestNftTokenId.length > index && (
                    <div>
                      <span className="text-2xl font-bai-jamjuree text-black">
                        NFT Token ID: {requestNftTokenId[index]}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-row">
                  <button
                    className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all m-2 tracking-widest`}
                    onClick={() => {
                      wrapSetLendId(id);
                      setIsSet(true);
                    }}
                    disabled={isLent[index] || !isValid[index]}
                  >
                    {isLent[index] && (
                      <>
                        Lent <LinkIcon className="w-3 h-3 mt-0.5" />
                      </>
                    )}
                      {isPaid[index] && !isLent[index] && (
                        <>
                          Paid <LinkIcon className="w-3 h-3 mt-0.5" />
                        </>
                      )}{!isLent[index] && !isValid[index] && !isPaid[index] && (
                      <>
                        Cancelled <NoSymbolIcon className="w-3 h-3 mt-0.5" />
                      </>
                    )}{!isLent[index] && isValid[index] && (
                      <>
                        Select <PaperAirplaneIcon className="w-3 h-3 mt-0.5" />
                      </>
                    )}
                  </button>
                  <button
                    className={`btn btn-primary capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all m-2 tracking-widest ${lendisLoading ? "loading" : ""
                      }`}
                    onClick={() => {
                      lendRequest();
                    }}
                    disabled={isLent[index] || !isValid[index] || !isSet || id != selectedRequestId}
                  >
                    {!lendisLoading && (
                      <>
                        {isSet && (
                          <>
                            {isLent[index] ? (
                              <>
                                Lent <LinkIcon className="w-3 h-3 mt-0.5" />
                              </>
                            ) : !isValid[index] ? (
                              <>
                                Cancelled <NoSymbolIcon className="w-3 h-3 mt-0.5" />
                              </>
                            ) : (
                              <>
                                Lend <PaperAirplaneIcon className="w-3 h-3 mt-0.5" />
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}

                  </button>
                  </div>
                </div>
              ))}
          </div>



        </div>
      </div>
    </div>


  );
};
