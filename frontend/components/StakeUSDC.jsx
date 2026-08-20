'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractUSDCVaultAddress, stakingVaultAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const StakeUSDC = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAmount, setaddedAmount] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAmount('');
                refetch();
                toast({
                    title: "Le stake a bien été effectué",
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

    const StakeUSDC = async() => {
        writeContract({
            address: contractUSDCVaultAddress,
            abi: stakingVaultAbi,
            functionName: 'deposit',
            args: [Number(addedAmount), address],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="💧" title="Stake USDC" description="Dépose de l'USDC dans le vault pour commencer à générer des rewards.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Montant</FormLabel>
                    <Input placeholder='0.0' value={addedAmount} onChange={(e) => setaddedAmount(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={StakeUSDC} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Stake
                </Button>
            </Stack>
        </FormCard>
  )
}

export default StakeUSDC
