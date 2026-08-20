'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const AddAssociation = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedName, setaddedName] = useState('');
    const [addedRNA, setaddedRNA] = useState('');
    const [addedAddr, setaddedAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedName('');
                setaddedRNA('');
                setaddedAddr('');
                refetch();
                toast({
                    title: "L'association a bien été ajoutée",
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

    const AddAssociation = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'addAssociation',
            args: [addedName, Number(addedRNA), addedAddr],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="🏛️" title="Ajouter une association" description="Réservé au propriétaire du contrat.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Nom</FormLabel>
                    <Input placeholder="Nom de l'association" value={addedName} onChange={(e) => setaddedName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">RNA</FormLabel>
                    <Input placeholder='Numéro RNA' value={addedRNA} onChange={(e) => setaddedRNA(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse</FormLabel>
                    <Input placeholder='0x...' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={AddAssociation} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Ajouter
                </Button>
            </Stack>
        </FormCard>
  )
}

export default AddAssociation
