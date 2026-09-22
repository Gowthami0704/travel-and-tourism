import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                forest: {
                    DEFAULT: '#1B4332',
                    dark: '#0D2319',
                    light: '#2D6A4F',
                    accent: '#40916C',
                },
                gold: {
                    DEFAULT: '#D4A574',
                    light: '#E9C49A',
                    dark: '#B08453',
                },
                cream: '#FAF3E0',
                navy: {
                    DEFAULT: '#0A0E1A',
                    card: '#111827',
                    border: '#1E293B',
                    lighter: '#161F36',
                },
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                serif: ['Playfair Display', ...defaultTheme.fontFamily.serif],
                display: ['Playfair Display', 'serif'],
            },
        },
    },

    plugins: [forms],
};
