'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const AddProjetAgricole = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedProjectDescription, setaddedProjectDescription] = useState('');
    const [addedSIRET, setaddedSIRET] = useState('');
    const [addedProjectAgriculteurAddr, setaddedProjectAgriculteurAddr] = useState('');
    const [addedAssociationAddr, setaddedAssociationAddr] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedProjectDescription('');
                setaddedSIRET('');
                setaddedProjectAgriculteurAddr('');
                setaddedAssociationAddr('');
                refetch();
                toast({
                    title: "Le projet agricole a bien été ajouté",
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

    const AddProjetAgricole = async() => {
        writeContract({
            address: contractProjectsFarmAddress,
            abi: contractProjectsFarmAbi,
            functionName: 'addProjectAgriculteur',
            args: [addedProjectDescription, Number(addedSIRET), addedProjectAgriculteurAddr, addedAssociationAddr],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="🌾" title="Ajouter un projet agricole" description="Réservé aux associations enregistrées.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Description</FormLabel>
                    <Input placeholder='Description du projet' value={addedProjectDescription} onChange={(e) => setaddedProjectDescription(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">SIRET</FormLabel>
                    <Input placeholder='Numéro SIRET' value={addedSIRET} onChange={(e) => setaddedSIRET(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du projet</FormLabel>
                    <Input placeholder='0x...' value={addedProjectAgriculteurAddr} onChange={(e) => setaddedProjectAgriculteurAddr(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse de l'association</FormLabel>
                    <Input placeholder='0x...' value={addedAssociationAddr} onChange={(e) => setaddedAssociationAddr(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={AddProjetAgricole} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Ajouter
                </Button>
            </Stack>
        </FormCard>
  )
}

export default AddProjetAgricole
