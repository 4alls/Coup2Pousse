'use client';
import { Flex, Heading, Text } from '@chakra-ui/react'

const NotConnected = () => {
  return (
    <Flex direction="column" align="center" justify="center" textAlign="center" py={24} gap={3}>
        <Text fontSize="4xl">🌾</Text>
        <Heading as="h2" size="md" color="whiteAlpha.900">
            Connecte ton wallet
        </Heading>
        <Text color="whiteAlpha.600" maxW="360px">
            Connecte-toi pour staker, suivre tes rewards et soutenir un projet agricole.
        </Text>
    </Flex>
  )
}

export default NotConnected
