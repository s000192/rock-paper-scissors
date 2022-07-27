import React from "react";
import { alpha, Box, BoxProps } from "@mui/material";
import { BROWN } from "../../palette";

const getFrameStyle = () => ({
  border: `2px solid ${BROWN}`,
  "&:before, &:after": {
    content: '""',
    position: "absolute",
    width: 14,
    height: 14,
    border: `2px solid ${BROWN}`,
  },
});
export type FramedBoxProps = BoxProps & { color?: "brown" | "green" };
const FramedBox: React.FC<FramedBoxProps> = ({
  children,
  color = "brown",
  ...boxProps
}) => {
  const frameStyle = getFrameStyle();
  return (
    <Box
      sx={{
        position: "relative",
        background: alpha(BROWN, 0.5),
        display: "flex",
        ...frameStyle,
        "&:before": {
          left: -2,
          top: -2,
        },
        "&:after": {
          right: -2,
          bottom: -2,
        },
      }}
    >
      <Box
        {...boxProps}
        sx={{
          ...boxProps?.sx,
          margin: (theme) => theme.spacing(0.5),
          ...frameStyle,
          "&:before": {
            left: -2,
            bottom: -2,
          },
          "&:after": {
            right: -2,
            top: -2,
          },
        }}
        flex={1}
      >
        {children}
      </Box>
    </Box>
  );
};
export default FramedBox;
