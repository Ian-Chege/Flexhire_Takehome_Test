import Image from "next/image";
import styles from "./page.module.css";
import { LoginPage } from "@/components/loginPage";

export default function Home() {
  return (
    <main className={styles.main}>
      <LoginPage />
    </main>
  );
}
