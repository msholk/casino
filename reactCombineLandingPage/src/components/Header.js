import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Home.module.css";
import logo from "../assets/logo.png";
export default function Header() {
  return (
    <div>
      <nav className={styles.navBar}>
        <div className="flex items-center">
          <img src={logo} width="80px" height="80px" />
          <div className="text-houseblue font-bold font-Prompt text-2xl">
            House Matrix
          </div>
        </div>

        <ConnectButton accountStatus="address" />
      </nav>
    </div>
  );
}
