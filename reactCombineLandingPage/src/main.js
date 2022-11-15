import styles from "./styles/Home.module.css";
import Welcome from "./components/Welcome";
import { useAccount } from "wagmi";
import Header from "./components/Header";

import GameComponent from "./GameComponent";
import { HeadProvider, Title, Link, Meta } from "react-head";
export default function Home() {
  const { address } = useAccount();
  return (
    <div>
      <Header />
      <Welcome />
      
    </div>
  );
}
