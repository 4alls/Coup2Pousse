'use client'

import { useState } from "react"
import { FormControl, FormLabel, Input, Button, Stack, useToast } from "@chakra-ui/react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractStakingVaultFactoryAddress, contractStakingVaultFactoryAbi } from "@/constants"
import FormCard from "./ui/FormCard"

const AddToken = ({ refetch }) => {

    const { address } = useAccount();
    const toast = useToast();

    const [addedName, setaddedName] = useState('');
    const [addedSymbol, setaddedSymbol] = useState('');
    const [addedAddr, setaddedAddr] = useState('');
    const [addedDivisor, setaddedDivisor] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setaddedName('');
                setaddedSymbol('');
                setaddedAddr('');
                setaddedDivisor('');
                refetch();
                toast({
                    title: "Le vault de staking a bien été créé",
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
            address: contractStakingVaultFactoryAddress,
            abi: contractStakingVaultFactoryAbi,
            functionName: 'createVault',
            args: [addedName, addedSymbol, addedAddr, Number(addedDivisor)],
            account: address,
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return (
        <FormCard icon="⚙️" title="Créer un vault de staking" description="Réservé au propriétaire de la factory.">
            <Stack spacing={3}>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Nom des parts</FormLabel>
                    <Input placeholder='Staked ...' value={addedName} onChange={(e) => setaddedName(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Symbole des parts</FormLabel>
                    <Input placeholder='s...' value={addedSymbol} onChange={(e) => setaddedSymbol(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Adresse du token</FormLabel>
                    <Input placeholder='0x...' value={addedAddr} onChange={(e) => setaddedAddr(e.target.value)} />
                </FormControl>
                <FormControl>
                    <FormLabel fontSize="sm" color="whiteAlpha.600">Diviseur du taux de reward</FormLabel>
                    <Input placeholder='1' value={addedDivisor} onChange={(e) => setaddedDivisor(e.target.value)} />
                </FormControl>
                <Button colorScheme='brand' onClick={AddToken} isLoading={isPending} loadingText="Envoi..." w="100%">
                    Créer le vault
                </Button>
            </Stack>
        </FormCard>
  )
}

export default AddToken
