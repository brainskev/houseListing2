const colors = require("tailwindcss/colors");
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
            },
            boxShadow: {
                soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 10px 30px rgba(15, 23, 42, 0.08)",
                lift: "0 2px 8px rgba(15, 23, 42, 0.10), 0 24px 60px rgba(15, 23, 42, 0.12)",
            },
            backgroundImage: {
                "hero-mesh":
                    "radial-gradient(1200px 500px at 20% 10%, rgba(59, 130, 246, 0.18), transparent 60%), radial-gradient(900px 400px at 80% 20%, rgba(16, 185, 129, 0.14), transparent 55%), radial-gradient(700px 380px at 55% 85%, rgba(99, 102, 241, 0.10), transparent 55%)",
            },
            gridTemplateColumns: {
                "70/30": "70% 28%",
            },
            colors: {
                brand: colors.blue,
            },
        },
    },
    plugins: [],
};