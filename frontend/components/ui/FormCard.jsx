'use client'
import { Box, HStack, Heading, Text, Stack } from '@chakra-ui/react'

const FormCard = ({ icon, title, description, children }) => {
  return (
    <Box
      bg="surface.raised"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      p={{ base: 5, md: 6 }}
      h="100%"
      transition="border-color 0.2s"
      _hover={{ borderColor: 'whiteAlpha.200' }}
    >
      <HStack spacing={2} mb={description ? 1 : 4}>
        {icon && <Text fontSize="lg">{icon}</Text>}
        <Heading as="h3" size="sm" color="whiteAlpha.900" fontWeight="semibold">
          {title}
        </Heading>
      </HStack>
      {description && (
        <Text fontSize="sm" color="whiteAlpha.500" mb={4}>
          {description}
        </Text>
      )}
      <Stack spacing={3}>{children}</Stack>
    </Box>
  )
}

export default FormCard
