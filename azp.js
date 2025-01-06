import { create } from 'twrnc';

const customStyles = {
  theme: {
      extend: {
          colors: {
              primary: "#161622",
              secondary: "#970000",
              secondary100: "#FF9001",
              secondary200: "#FF8E01",
              black: "#000",
              black100: "#1E1E2D",
              black200: "#232533",
              gray100: "#CDCDE0",
              aliah: "#F3F3F3",
              didi: "#A0A0A0",
              white: "#fff",
              ihax:"#C15FF9",
              ndIhax:"#FBA8FF",
          },
          fontFamily: {
              pthin: ["Poppins-Thin", "sans-serif"],
              pextralight: ["Poppins-ExtraLight", "sans-serif"],
              plight: ["Poppins-Light", "sans-serif"],
              pregular: ["Poppins-Regular", "sans-serif"],
              pmedium: ["Poppins-Medium", "sans-serif"],
              psemibold: ["Poppins-SemiBold", "sans-serif"],
              pbold: ["Poppins-Bold", "sans-serif"],
              pextrabold: ["Poppins-ExtraBold", "sans-serif"],
              pblack: ["Poppins-Black", "sans-serif"],
          },
      },
  },
};

const azp = create(customStyles);

export default azp;
