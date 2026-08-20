import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    fonts: {
        heading: `'Inter', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    colors: {
        brand: {
            50: '#eafff4',
            100: '#c3ffe0',
            200: '#8dffc4',
            300: '#54f5a5',
            400: '#2fd888',
            500: '#1fb473',
            600: '#158f5c',
            700: '#0f6d47',
            800: '#0a4c32',
            900: '#062f20',
        },
        accent: {
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
        },
        surface: {
            base: '#070B10',
            raised: '#0D141C',
        },
    },
    styles: {
        global: {
            'html, body': {
                bg: 'surface.base',
                color: 'whiteAlpha.900',
                minHeight: '100vh',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: '600',
                borderRadius: 'xl',
            },
        },
        Input: {
            variants: {
                outline: {
                    field: {
                        bg: 'whiteAlpha.50',
                        borderColor: 'whiteAlpha.200',
                        _hover: { borderColor: 'whiteAlpha.300' },
                        _focus: {
                            borderColor: 'brand.400',
                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                        },
                    },
                },
            },
        },
        Tabs: {
            variants: {
                'soft-rounded': {
                    tab: {
                        color: 'whiteAlpha.600',
                        fontWeight: '600',
                        _selected: {
                            color: 'surface.base',
                            bg: 'brand.400',
                        },
                    },
                },
            },
        },
    },
})

export default theme
