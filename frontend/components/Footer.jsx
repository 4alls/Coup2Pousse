"use client"
import { Flex, Text, Link } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Flex
        as="footer"
        justifyContent="center"
        alignItems="center"
        py={6}
        px={4}
        mt="auto"
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
    >
        <Text fontSize="sm" color="whiteAlpha.500">
            Thibaut BAUDRY &copy; Alyra {new Date().getFullYear()} ·{' '}
            <Link
                href="https://github.com/ThibautBaudry/Coup2Pousse"
                isExternal
                color="whiteAlpha.600"
                _hover={{ color: 'brand.400' }}
            >
                GitHub
            </Link>
        </Text>
    </Flex>
  )
}

export default Footer
