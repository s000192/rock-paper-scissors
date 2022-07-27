import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material";

const StyledBox = styled(Box)(({ theme }) => ({
  // border: `2px solid ${theme.palette.primary.main}`,
  display: "flex",
  color: "#000"
  // "& > *:not(:last-child)": {
  //   borderRight: `2px solid ${theme.palette.primary.main}`,
  // },
}));
const InfoBox: React.FC<BoxProps & { withDivider?: boolean }> = ({
  children,
  withDivider,
  ...boxProps
}) => {
  return <StyledBox {...boxProps}>{children}</StyledBox>;
};
export default InfoBox;
