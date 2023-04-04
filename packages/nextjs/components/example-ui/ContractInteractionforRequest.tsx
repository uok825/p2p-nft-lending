import { useEffect, useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { ArrowSmallRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { BigNumber } from "ethers";
import { useAccount, useContractWrite } from "wagmi";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

export const ContractInteractionforRequest = () => {

  const startTime = Math.floor(Date.now() / 1000);

  const [userNftContractAddress, setUserNftContractAddress] = useState("");
  const [nftTokenId, setNftTokenId] = useState(0);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [paymentTime, setPaymentTime] = useState(0);
  const [requestId, setRequestId] = useState([]);
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
  const {address, isConnected} = useAccount();

  const [allRequestIds, setAllRequestIds] = useState([]);
  const NFTLendingBorrowingContractInfo = useDeployedContractInfo("NFTLendingBorrowing");
  const NFTContractInfo = useDeployedContractInfo("NFT");
  const NFTLendingBorrowingContractAddress = NFTLendingBorrowingContractInfo?.data?.address;
  const NFTContractAddress = NFTContractInfo?.data?.address;

  const wrapSetPaybackId = (id: any) => {
    setPaybackBorrowId(id);
    let newDate = Math.floor(Date.now() / 1000) + 90;
    setDate(newDate);
  }


  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "requests",
    args: [(allRequestIds[0])],
    onSuccess(data: any) {
        setTokenId(data.nftTokenId.toString());
        setPaymentTime(data.paymentTime.toString());
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

  useScaffoldContractRead({
    contractName: "NFTLendingBorrowing",
    functionName: "getRequestDetails",
    onSuccess(allRequestDetails: any) {
      setRequestId(allRequestDetails.requestId?.map((id: any) => id.toString()) || []);
      setRequestedAmount(allRequestDetails.requestedAmount?.map((amount: any) => amount.div(BigNumber.from(10).pow(18)).toString()) || []);
      setPaymentTime(allRequestDetails.paymentTime?.map((time: any) => time.toString()) || []);
    },
  });

  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary w-128">
          <span className="text-4xl sm:text-4xl font-bold text-black">Request</span>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                        {requestId.length > 0 && requestId.map((id: any) => (
              <span className="text-2xl font-bai-jamjuree text-black">{id}, </span>
          ))}
          </div>
          <div className="flex rounded-full p-1 flex-shrink-0">
            <div className="flex rounded-full  p-1">
            </div>
          </div>
        </div>
      </div>
    </div>


  );
};
