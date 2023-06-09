import { useEffect, useRef, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { BigNumber } from "ethers";
import { useAnimationConfig, useScaffoldContractRead, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";


export const ContractData = () => {


  const [personBorrowIds, setPersonBorrowIds] = useState([]);
  const [personRequestIds, setPersonRequestIds] = useState([]);
  const {address, isConnected} = useAccount();


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



  return (
    <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className="flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full">
        <div className="flex justify-between w-full">
          <div className="border border-primary rounded-xl flex">
            <div className="p-2 py-1 border-r border-primary flex items-end">Borrow & Request ID's</div>
            {personBorrowIds.length > 0 && personBorrowIds.map((id: any) => (
            <div className="border border-primary rounded-xl flex">
              <div className="p-2 py-1 border-r border-primary flex items-end">{id}</div>
            </div>
          ))}
          </div>

        </div>

        <div className="mt-3 border border-primary bg-neutral rounded-3xl text-secondary  overflow-hidden text-[116px] whitespace-nowrap w-full uppercase tracking-tighter font-bai-jamjuree leading-tight">
          <div className="" >
            <div className="absolute -left-[9999rem]">
              <div className="px-4">

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};