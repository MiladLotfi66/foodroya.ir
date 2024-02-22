/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode:"class",

  theme: {
    extend: {
      letterSpacing: {
        "tightest": '-.065em',
      },
      container:{
        center:true,
        padding:{
          DEFAULT:'1rem',
          lg:"0.625rem"
        }
      },
    
      colors: {
        brown: {
          100: "#ECE0D1",
          300: "#DBC1AC",
          600: "#967259",
          900: "#634832",
        },
      },
      fontFamily:{
        "Vazir":"Vazir",
        "Dana":"Dana",
        "DanaMedium":"Dana Medium",
        "DanaDemiBold":"Dana DemiBold",
        "MorabbaLight":"Morabba Light",
        "MorabbaBold":"Morabba Bold",
        "MorabbaMedium":"Morabba Medium",
        "IranSans":"IranSans",
      },

      boxShadow: {
        "shadow-normal": " 0px 1px 10px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "home-desktop":"url(../../public/Images/jpg/cake.jpg)",
        // "home-mobile":"url()"
        // "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        // "gradient-conic":
        // "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
    },
  },

  plugins: [ function({ addVariant }) {
    addVariant('child', '&>*');
    addVariant('child-hover', '&>*:hover');
  }],
};
