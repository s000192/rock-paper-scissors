import { createTheme } from "@mui/material/styles";
import * as palette from "./palette";
const theme = createTheme({
  typography: {
    fontSize: 14,
    fontFamily: ["IBM Plex Sans", "Helvetica", "Arial", "sans-serif"].join(","),
    h1: {
      fontSize: "2.5rem",
    },
    h2: {
      fontSize: "2rem",
    },
    h3: {
      fontSize: "1.5rem",
    },
    h4: {
      fontSize: "1.25rem",
    },
    h5: {
      fontSize: "1.125rem",
    },
    h6: {
      fontSize: "1.125rem",
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
    subtitle1: {
      fontSize: "1rem",
    },
    overline: {
      fontSize: "0.875rem",
    },
  },
  palette: {
    mode: "dark",
    background: {
      default: "#ececec",
      paper: "#fff",
    },
    primary: {
      main: "#000",
    },
    secondary: {
      main: palette.BROWN,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "outlined",
      },
      variants: [
        {
          props: { variant: "text" },
          style: {
            color: "#000",
          },
        },
      ],
    },
    MuiPaper: {},
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            width: ".5em",
          },
          "*::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "#999",
            borderRadius: 10,
          },
        },
      },
    },
  },
});
export default theme;
