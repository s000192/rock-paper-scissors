import { Button, styled, ButtonProps as MuiButtonProps } from "@mui/material";

export interface ButtonProps extends MuiButtonProps<any> { }

export default styled(Button)<ButtonProps>(({ theme }) => ({
  borderRadius: 0,
  padding: theme.spacing(1, 4, 1.5, 4),
  transition: "0.1s ease-out",
  "&:hover": {
    opacity: 0.9,
    backgroundColor: "transparent",
    transform: "scale(1.05)",
  },
  "&.MuiButton-outlined": {
    color: "#000",
    fontWeight: 600,
    letterSpacing: 1,
    border: "none",
    // backgroundImage: `url("./images/button-frame.svg")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    "&.Mui-disabled": {
      opacity: 0.5,
      filter: "grayscale(1)",
    },
  },
}));
