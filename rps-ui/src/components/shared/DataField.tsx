import React from "react";
import { Box, Typography, styled, Divider } from "@mui/material";

type DataFieldProps = {
  label: React.ReactNode;
  value?: React.ReactNode;
  display?: "inline" | "block";
};
const Label = styled((props) => <Typography {...props} variant="overline" />)(
  ({ theme }) => ({
    fontSize: 12,
    letterSpacing: 1,
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
    color: theme.palette.text.secondary,
    lineBreak: "anywhere",
  })
);

const DataField = ({ label, value, display = "inline" }: DataFieldProps) => {
  const isInline = display === "inline";
  return (
    <>
      <Label>
        <span>{label}</span>
        <Box flex={1} mx={0.5}>
          <Divider />
        </Box>
        {isInline && (
          <Box component="span" maxWidth="50%">
            {value}
          </Box>
        )}
      </Label>
      {!isInline && (
        <Label
          sx={{
            lineHeight: 1.5,
            width: "100%",
          }}
        >
          {value}
        </Label>
      )}
    </>
  );
};

export default DataField;
