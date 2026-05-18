// styles/children-theme.ts

export const childrenTheme = {
    colors: {
        toddler: {
            primary: ['#FFB6C1', '#FFD700', '#98FB98'],
            secondary: ['#87CEEB', '#DDA0DD', '#F0E68C'],
            accents: ['#FF69B4', '#FFA07A', '#20B2AA'],
        },
        preschool: {
            primary: ['#FF7F50', '#6495ED', '#FFDAB9'],
            secondary: ['#E6E6FA', '#FFF0F5', '#F0FFF0'],
            accents: ['#FF6347', '#4169E1', '#32CD32'],
        },
        elementary: {
            primary: ['#4682B4', '#32CD32', '#FFA500'],
            secondary: ['#F0E68C', '#E0FFFF', '#FFE4E1'],
            accents: ['#8A2BE2', '#DC143C', '#2E8B57'],
        },
        preteen: {
            primary: ['#483D8B', '#2F4F4F', '#8B4513'],
            secondary: ['#DAA520', '#CD853F', '#B8860B'],
            accents: ['#4B0082', '#006400', '#8B0000'],
        },
    },

    animations: {
        bounce: 'bounce 2s infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
    },

    characters: {
        toddler: ['🐣', '🐝', '🐌', '🐞', '🦋'],
        preschool: ['🦊', '🐻', '🦝', '🐼', '🐨'],
        elementary: ['🦁', '🐯', '🦅', '🐺', '🦌'],
        preteen: ['🐉', '🦄', '🐲', '🦁', '🐺'],
    },

    fonts: {
        heading: 'Comic Sans MS, Bubblegum Sans, Inter',
        body: 'Open Sans, Inter',
        interactive: 'Quicksand, Inter',
    },
};
