import AddAssociation from "./AddAssociation"
import AddProjetAgricole from "./AddProjetAgricole"
import DeleteAssociation from "./DeleteAssociation"
import DeleteProjetAgricole from "./DeleteProjetAgricole"
import AddToken from "./AddToken"
import StakeUSDC from "./StakeUSDC"
import StakeOtherToken from "./StakeOtherToken"
import WithdrawUSDC from "./WithdrawUSDC"
import WithdrawOtherToken from "./WithdrawOtherToken"
import CalculateRewards from "./CalculateRewards"
import GetRewardsAndSupportProject from "./GetRewardsAndSupportProject"

import { useAccount, useReadContract } from 'wagmi'
import { contractProjectsFarmAddress, contractProjectsFarmAbi } from '@/constants'

import { Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid } from '@chakra-ui/react'

const C2P = () => {

    const { address } = useAccount();

    const { data: addressOfAssociation, error, isPending, refetch } = useReadContract({
      address: contractProjectsFarmAddress,
      abi: contractProjectsFarmAbi,
      functionName: 'getAssociation',
      account: address
  })

    return (
        <Tabs colorScheme="brand" variant="soft-rounded" isLazy>
            <TabList overflowX="auto" pb={2} gap={2} sx={{ '::-webkit-scrollbar': { display: 'none' } }}>
                <Tab>💧 Staking</Tab>
                <Tab>🎁 Rewards</Tab>
                <Tab>🌾 Projets</Tab>
                <Tab>⚙️ Admin</Tab>
            </TabList>

            <TabPanels mt={6}>
                <TabPanel px={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <StakeUSDC refetch={refetch} />
                        <StakeOtherToken refetch={refetch} />
                        <WithdrawUSDC refetch={refetch} />
                        <WithdrawOtherToken refetch={refetch} />
                    </SimpleGrid>
                </TabPanel>

                <TabPanel px={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <CalculateRewards refetch={refetch} />
                        <GetRewardsAndSupportProject refetch={refetch} />
                    </SimpleGrid>
                </TabPanel>

                <TabPanel px={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <AddAssociation refetch={refetch} />
                        <DeleteAssociation refetch={refetch} />
                        <AddProjetAgricole refetch={refetch} />
                        <DeleteProjetAgricole refetch={refetch} />
                    </SimpleGrid>
                </TabPanel>

                <TabPanel px={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <AddToken refetch={refetch} />
                    </SimpleGrid>
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default C2P
