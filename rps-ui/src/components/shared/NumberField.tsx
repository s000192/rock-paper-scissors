import { TextField, styled } from "@mui/material";

const NumberField = styled(TextField)(({ theme }) => ({
  border: "none",
  overflow: "hidden",
  borderRadius: 4,
  "& .MuiFilledInput-input": {
    padding: theme.spacing(0, 0.5, 0, 2),
    textAlign: "center",
    fontFamily: "Abril Fatface",
    fontSize: theme.typography.h1.fontSize,
  },
  "& .MuiFormHelperText-root": {
    margin: 0,
  },
  "& .MuiOutlinedInput-root": {
    color: "#000"
  }
}));

export default NumberField;
