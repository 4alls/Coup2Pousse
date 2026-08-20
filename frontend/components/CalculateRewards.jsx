'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const CalculateRewards = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAddrChainlink, setaddedAddrChainlink] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAddrChainlink('');
                refetch();
                toast({
                    title: "Rewards disponibles",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            },
            onError: (error) => {
                toast({
                    title: error.shortMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
        },
    })

    const CalculateRewards = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'calculateRewards',
            args: [addedAddrChainlink],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="🧮" title="Calculer les rewards" description="Estime la valeur de tes rewards accumulées.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse Chainlink</FormLabel>
                    <Input placeholder='0x...' value={addedAddrChainlink} onChange={(e) => setaddedAddrChainlink(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={CalculateRewards} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Calculer
                </Button>
            </Stack>
        </FormCard>
  )
}

export default CalculateRewards
