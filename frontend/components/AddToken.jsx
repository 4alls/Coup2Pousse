'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingAddress, contractStakingAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const AddToken = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedName, setaddedName] = useState('');
    const [addedAddr, setaddedAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedName('');
                setaddedAddr('');
                refetch();
                toast({
                    title: "Le token a bien été ajouté",
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

    const AddToken = async() => {
        writeContract({
            address: contractStakingAddress,
            abi: contractStakingAbi,
            functionName: 'addToken',
            args: [addedName, addedAddr],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="⚙️" title="Ajouter un token stakable" description="Réservé au propriétaire du contrat.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Nom</FormLabel>
                    <Input placeholder='Nom du token' value={addedName} onChange={(e) => setaddedName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse</FormLabel>
                    <Input placeholder='0x...' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={AddToken} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Ajouter
                </Button>
            </Stack>
        </FormCard>
  )
}

export default AddToken
