"use client"
import Header from './Header'
import Footer from './Footer'
import { Flex, Box } from '@chakra-ui/react'

const Layout = ({ children }) => {
  return (
    <Flex
      direction="column"
      minH="100vh"
      bgGradient="linear(to-b, #070B10, #0B121A)"
    >
        <Header />
        <Box
          flex="1"
          w="100%"
          maxW="1100px"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={{ base: 6, md: 10 }}
        >
            {children}
        </Box>
        <Footer />
    </Flex>
  )
}

export default Layout
