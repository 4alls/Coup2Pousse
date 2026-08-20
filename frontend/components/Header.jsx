"use client"
import { Flex, HStack, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Header = () => {
  return (
    <Flex
        as="header"
        position="sticky"
        top={0}
        zIndex={10}
        justifyContent="space-between"
        alignItems="center"
        px={{ base: 4, md: 8 }}
        py={4}
        bg="rgba(7, 11, 16, 0.72)"
        backdropFilter="blur(14px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
    >
        <HStack spacing={2}>
            <Text fontSize="xl">🌱</Text>
            <Text fontSize="lg" fontWeight="bold" letterSpacing="tight" color="whiteAlpha.900">
                Coup2Pousse
            </Text>
        </HStack>
        <ConnectButton showBalance={false} />
    </Flex>
  )
}

export default Header
