import Head from "next/head";

import Header from "@/components/Header";
import Claim from "@/components/Claim";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>ERC20 Token Bridge</title>
        <meta name="description" content="ERC20 Token Bridge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>
        <Claim />
      </main>
      <Footer />
    </>
  );
}
