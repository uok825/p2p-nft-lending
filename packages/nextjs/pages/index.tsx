import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";
import { CheckBadgeIcon, SparklesIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>NFT Borrowing Lending</title>
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

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-col">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8" />
              <p>
                You can create a Borrow Request.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8" />
              <p>
                You can delete a Borrow Request.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8" />
              <p>
                You can Lend a Borrow Request.
              </p>
            </div>
            </div>
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8" />
              <p>
                You can view your Borrow Requests and Lent Borrows.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8" />
              <p>
                You can liquidate a Borrow Request if the payment has expired.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8" />
              <p>
                You can repay a Lent Borrow Request by adding interest to it.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
