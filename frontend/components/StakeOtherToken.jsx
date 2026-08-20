'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingVaultFactoryAddress, contractStakingVaultFactoryAbi, stakingVaultAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const StakeOtherToken = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedAmount, setaddedAmount] = useState('');
    const [addedAddrOther, setaddedAddrOther] = useState('');

    const { data: vaultAddress } = useReadContract({
        address: contractStakingVaultFactoryAddress,
        abi: contractStakingVaultFactoryAbi,
        functionName: 'getVault',
        args: [addedAddrOther],
        query: { enabled: addedAddrOther.length === 42 },
    })

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedAmount('');
                setaddedAddrOther('');
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

    const StakeOtherToken = async() => {
        writeContract({
            address: vaultAddress,
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
        <FormCard icon="🪙" title="Stake un autre token" description="Dépose un token enregistré comme stakable — son vault est résolu automatiquement via la factory.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Montant</FormLabel>
                    <Input placeholder='0.0' value={addedAmount} onChange={(e) => setaddedAmount(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du token</FormLabel>
                    <Input placeholder='0x...' value={addedAddrOther} onChange={(e) => setaddedAddrOther(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={StakeOtherToken} isLoading={isPending} loadingText="Envoi..." w="100%" isDisabled={!vaultAddress}>
                    Stake
                </Button>
            </Stack>
        </FormCard>
  )
}

export default StakeOtherToken
