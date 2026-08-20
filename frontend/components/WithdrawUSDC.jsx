'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractUSDCVaultAddress, stakingVaultAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const WithdrawUSDC = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAmount, setaddedAmount] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAmount('');
                refetch();
                toast({
                    title: "Le withdraw a bien été effectué",
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

    const WithdrawUSDC = async() => {
        writeContract({
            address: contractUSDCVaultAddress,
            abi: stakingVaultAbi,
            functionName: 'withdraw',
            args: [Number(addedAmount), address, address],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="📤" title="Withdraw USDC" description="Retire une partie de ton stake USDC.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Montant</FormLabel>
                    <Input placeholder='0.0' value={addedAmount} onChange={(e) => setaddedAmount(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={WithdrawUSDC} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Withdraw
                </Button>
            </Stack>
        </FormCard>
  )
}

export default WithdrawUSDC
