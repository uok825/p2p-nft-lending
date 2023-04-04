import Head from "next/head";
import type { NextPage } from "next";
import { ContractInteractionforRequest } from "~~/components/example-ui/ContractInteractionforRequest";

const ExampleUI: NextPage = () => {
  return (
    <>
      <Head>
        <title>NFT Borrowing Lending</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>
      <div className="flex-grow" data-theme="exampleUi">
        <ContractInteractionforRequest />
      </div>
    </>
  );
};

export default ExampleUI;
