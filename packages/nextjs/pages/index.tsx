import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";
import { ChevronLeftIcon,ChevronRightIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>NFT Lending Borrowing</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome To</span>
            <span className="block text-4xl font-bold">NFT Borrowing & Lending Platform</span>
          </h1>
          <p className="text-center text-lg">
            This is a demo site of a NFT Borrowing & Lending Platform built with{" "}
            <code className="italic bg-base-300 text-base font-bold">Scaffold-ETH2</code>
          </p>
          <p className="text-center text-lg">
            With our NFT Borrowing and Lending platform, you can borrow in ETH by showing NFT collateral.
          </p>

        </div>

        <div className="flex-1 justify-around flex-none flex-row bg-base-300 w-full mt-16 px-8 py-12">
            <div className="flex flex-wrap justify-around">
            <div className="flex-1 flex-none items-center flex-row bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <span className="block text-4xl mb-2">Step 1</span>
            <span className="block text-3xl mb-2">Mint Test NFT</span>
              <p className="text-xl">
              First, we create a test NFT on our demo site and approve it.
              This forms the basis of the lending-borrowing process.
              </p>
            </div>
            <div className="flex-1 flex-none flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <span className="block text-4xl mb-2">Step 2</span>
            <span className="block text-3xl mb-2">Create Borrowing Request</span>
              <p className="text-xl">
              In the "Create Request" section, you need to enter the NFT contract address, NFT token IDs,
                the amount you want to borrow, and the borrowing period.
                This creates a borrowing request.
              </p>
            </div>
            <div className="flex-1 flex-none flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <span className="block text-4xl mb-2">Step 3</span>
            <span className="block text-3xl mb-2">Cancel Request</span>
              <p className="text-xl">
              You can cancel the request at any time before it has been lent out, if needed.
              </p>
            </div>
            <div className="flex-1 flex-none flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <span className="block text-4xl mb-2">Step 4</span>
            <span className="block text-3xl mb-2">Lend and Payment Time</span>
              <p className="text-xl">
                You can view all Request with details.
              </p>
            </div>
            <div className="flex-1 flex-none flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
            <span className="block text-4xl mb-2">Step 5</span>
            <span className="block text-3xl mb-2">Repay or Liquidate</span>
              <p className="text-xl">
                You can liquidate a Borrow Request if the payment has expired.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
