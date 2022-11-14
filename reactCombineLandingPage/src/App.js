import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import Home from "./main";
import {
  injectedWallet,
  argentWallet,
  braveWallet,
  coinbaseWallet,
  ledgerWallet,
  trustWallet,
  imTokenWallet,
  omniWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: "9uOWZ_yYi9AI3vDEifWXCKnk2Jkbcy8p" }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains }),
      coinbaseWallet({ chains }),
      trustWallet({ chains }),
      braveWallet({ chains }),
    ],
  },
  {
    groupName: "Others",
    wallets: [
      walletConnectWallet({ chains }),
      ledgerWallet({ chains }),
      argentWallet({ chains }),
      omniWallet({ chains }),
      imTokenWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#8614f8",
          accentColorForeground: "white",
          borderRadius: "large",
          fontStack: "system",
        })}
      >
        <Home />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
