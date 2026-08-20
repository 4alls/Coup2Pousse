'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const GetRewardsAndSupportProject = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedVaultToken, setaddedVaultToken] = useState('');
    const [addedAddrProject, setaddedAddrProject] = useState('');
    const [addedAddrChainlink, setaddedAddrChainlink] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedVaultToken('');
                setaddedAddrProject('');
                setaddedAddrChainlink('');
                refetch();
                toast({
                    title: "Rewards récupérées et projet soutenu",
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

    const GetRewardsAndSupport = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'getRewardAndSupportProject',
            args: [addedVaultToken, addedAddrProject, addedAddrChainlink],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="🎁" title="Récupérer & soutenir un projet" description="Réclame tes rewards sur un vault, partagées 50/50 avec un projet agricole.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du token stakable (vault)</FormLabel>
                    <Input placeholder='0x...' value={addedVaultToken} onChange={(e) => setaddedVaultToken(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du projet agricole</FormLabel>
                    <Input placeholder='0x...' value={addedAddrProject} onChange={(e) => setaddedAddrProject(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse Chainlink</FormLabel>
                    <Input placeholder='0x...' value={addedAddrChainlink} onChange={(e) => setaddedAddrChainlink(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={GetRewardsAndSupport} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Récupérer & soutenir
                </Button>
            </Stack>
        </FormCard>
  )
}

export default GetRewardsAndSupportProject
