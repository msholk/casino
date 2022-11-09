import Head from "next/head"
import styles from "../styles/Home.module.css"
import Welcome from "../components/Welcome"
import { useAccount } from "wagmi"
import Header from "../components/Header"
import Bottom from "../components/Bottom"
export default function Home() {
    const { address } = useAccount()
    return (
        <div>
            <Head>
                <title>House Matrix</title>
                <meta
                    name="description"
                    content="The Decentralized Casino Bet with BTC, ETH, and ,Stablecoins directly from your wallet"
                />
                <link rel="icon" href="/logo.ico" />
            </Head>

            <Header />
            <Welcome />
            <Bottom />
        </div>
    )
}
