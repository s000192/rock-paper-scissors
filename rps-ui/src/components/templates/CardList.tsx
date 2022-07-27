import React from "react";
import { Box, BoxProps } from "@mui/material";

const CardList: React.FC<BoxProps> = ({ children, ...boxProps }) => (
  <Box display="grid" style={{ gridGap: 24 }} {...boxProps}>
    {children}
  </Box>
);
export default CardList;
