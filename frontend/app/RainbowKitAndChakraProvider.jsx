'use client';
import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  hardhat
} from 'viem/chains';
import {
  sepolia
} from '@/utils/sepolia'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import theme from '@/theme';

const config = getDefaultConfig({
    appName: 'Coup2Pousse',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    chains: [sepolia, hardhat],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const rainbowKitTheme = darkTheme({
    accentColor: '#2fd888',
    accentColorForeground: '#070B10',
    borderRadius: 'large',
    overlayBlur: 'small',
});

const RainbowKitAndChakraProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={rainbowKitTheme}>
                <ChakraProvider theme={theme}>
                    {children}
                </ChakraProvider>
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitAndChakraProvider