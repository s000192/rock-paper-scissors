import Grid, { GridProps } from "@mui/material/Grid";
import { styled } from "@mui/material";

const StyledGrid = styled(Grid)(({ theme }) => ({
  // border: `2px solid ${theme.palette.primary.main}`,
  // display: "flex",
  // "& > *:not(:last-child)": {
  //   borderRight: `2px solid ${theme.palette.primary.main}`,
  // },
}));

const InfoGrid: React.FC<GridProps> = ({
  children,
  ...gridProps
}) => {
  return <StyledGrid {...gridProps}>{children}</StyledGrid>;
}
export default InfoGrid;