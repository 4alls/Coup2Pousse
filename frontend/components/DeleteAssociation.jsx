'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const DeleteAssociation = ({ refetch }) => {

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
                    title: "L'association a bien été supprimée",
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

    const DeleteAssociation = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'deleteAssociation',
            args: [addedName, addedAddr],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="🗑️" title="Supprimer une association" description="Réservé au propriétaire du contrat.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Nom</FormLabel>
                    <Input placeholder="Nom de l'association" value={addedName} onChange={(e) => setaddedName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse</FormLabel>
                    <Input placeholder='0x...' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={DeleteAssociation} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Supprimer
                </Button>
            </Stack>
        </FormCard>
  )
}

export default DeleteAssociation
