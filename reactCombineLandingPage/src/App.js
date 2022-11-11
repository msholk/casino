import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import Home from "./main";

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: "9uOWZ_yYi9AI3vDEifWXCKnk2Jkbcy8p" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

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
