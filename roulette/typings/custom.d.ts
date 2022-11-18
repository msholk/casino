import { MetaMaskInpageProvider } from "@metamask/providers"
import { ExternalProvider } from "@ethersproject/providers"

// Intersect metamask and ethers provider
type Provider = MetaMaskInpageProvider & ExternalProvider

declare global {
    interface Window {
        ethereum?: Provider
        uniqueEvents: Record<string, boolean>
    }
}
