import React from "react";
import AppBar from "../navigation/AppBar";
import { Box, styled } from "@mui/material";
import { keyframes } from "@mui/styled-engine";

const contentZIndex = 2;
const BaseBox = styled(Box)((theme) => ({
  background: "#fff;",
  // backgroundImage: `url("./images/mooning.png"), linear-gradient(to bottom right, #587C70, #000000)`,
  backgroundAttachment: "fixed",
  height: "100vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));

const Video = styled("video")({
  objectFit: "cover",
  width: "100vw",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 0,
  transition: "0.1s ease-out",
});
const fading = keyframes`
0% {
  opacity: 0.15;
}
50% {
  opacity: 0.6;
}
75% {
  opacity: 0.4;
}

100% {
  opacity: 0.15;
}
`;

const Base: React.FC = ({ children }) => {
  return (
    <BaseBox>
      <Box px={{ xs: 2, sm: 4 }} pt={{ xs: 2, sm: 4 }} zIndex={contentZIndex}>
        <AppBar />
      </Box>

      <Box
        zIndex={contentZIndex}
        flex={1}
        display="flex"
        flexDirection="column"
        overflow="auto"
        pb={10}
      >
        {children}
      </Box>

    </BaseBox>
  );
};
export default Base;
