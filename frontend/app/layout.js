import RainbowKitAndChakraProvider from "./RainbowKitAndChakraProvider";
import Layout from "@/components/Layout";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Coup2Pousse",
  description: "Dapp de staking à impact positif : soutenez des projets agricoles innovants.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <RainbowKitAndChakraProvider>
          <Layout>
            {children}
          </Layout>
        </RainbowKitAndChakraProvider>
      </body>
    </html>
  );
}
