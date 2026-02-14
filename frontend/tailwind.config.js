/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--color-bg-primary)',
                'bg-secondary': 'var(--color-bg-secondary)',
                'sidebar': 'var(--color-sidebar)',
                'header': 'var(--color-header)',
                'accent-peach': 'var(--color-accent-peach)',
                'accent-mint': 'var(--color-accent-mint)',
                'accent-sky': 'var(--color-accent-sky)',
                'accent-lavender': 'var(--color-accent-lavender)',
                'accent-yellow': 'var(--color-accent-yellow)',
                'text-main': 'var(--color-text-main)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-light': 'var(--color-text-light)',
                'primary': 'var(--color-primary)',
                'primary-light': 'var(--color-primary-light)',
                'success': 'var(--color-success)',
                'warning': 'var(--color-warning)',
                'danger': 'var(--color-danger)',
            },
            borderRadius: {
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
            },
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
            }
        },
    },
    plugins: [],
}
