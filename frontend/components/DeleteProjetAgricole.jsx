'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const DeleteProjetAgricole = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedDescription, setaddedDescription] = useState('');
    const [addedAddr, setaddedAddr] = useState('');
    const [addedAssociationAddr, setaddedAssociationAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedDescription('');
                setaddedAddr('');
                setaddedAssociationAddr('');
                refetch();
                toast({
                    title: "Le projet agricole a bien été supprimé",
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

    const DeleteProjetAgricole = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'deleteProjectAgriculteur',
            args: [addedDescription, addedAddr, addedAssociationAddr],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="🗑️" title="Supprimer un projet agricole" description="Réservé aux associations enregistrées.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Description</FormLabel>
                    <Input placeholder='Description du projet' value={addedDescription} onChange={(e) => setaddedDescription(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du projet</FormLabel>
                    <Input placeholder='0x...' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse de l'association</FormLabel>
                    <Input placeholder='0x...' value={addedAssociationAddr} onChange={(e) => setaddedAssociationAddr(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={DeleteProjetAgricole} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Supprimer
                </Button>
            </Stack>
        </FormCard>
  )
}

export default DeleteProjetAgricole
