'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, Text, useToast } from "@chakra-ui/react"
import { useAccount, useReadContract } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const CalculateRewards = () => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedVaultToken, setaddedVaultToken] = useState('');
    const [addedAddrChainlink, setaddedAddrChainlink] = useState('');

    const { data: rewards, refetch, isFetching } = useReadContract({
        address: contractStakingAddress,
        abi: contractStakingAbi,
        functionName: 'calculateRewards',
        args: [addedVaultToken, addedAddrChainlink],
        account: address,
        query: { enabled: false },
    })

    const CalculateRewards = async() => {
        const { error } = await refetch();
        if (error) {
            toast({
                title: error.shortMessage ?? error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    return (
        <FormCard icon="🧮" title="Calculer les rewards" description="Estime la valeur de tes rewards accumulées sur un vault.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du token stakable (vault)</FormLabel>
                    <Input placeholder='0x...' value={addedVaultToken} onChange={(e) => setaddedVaultToken(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse Chainlink</FormLabel>
                    <Input placeholder='0x...' value={addedAddrChainlink} onChange={(e) => setaddedAddrChainlink(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={CalculateRewards} isLoading={isFetching} loadingText="Calcul..." w="100%">
                    Calculer
                </Button>
                {rewards !== undefined && (
                    <Text fontSize="sm" color="whiteAlpha.700">
                        Rewards estimées : <b>{rewards.toString()}</b>
                    </Text>
                )}
            </Stack>
        </FormCard>
  )
}

export default CalculateRewards
