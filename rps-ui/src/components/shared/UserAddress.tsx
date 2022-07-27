import { Box } from "@mui/material";
import { Address } from '../../contexts/ConnectContext';

const Address = ({ address }: { address?: Address }) => {
  return (
    <Box
      sx={{
        width: 200,
        height: 70,
        display: "flex",
        alignItems: "center",
        // backgroundImage: `url("./images/brush-1.svg")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    >
      <Box
        sx={{
          p: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontSize: 12,
          color: "black",
        }}
      >
        {address}
      </Box>
    </Box>
  );
};
export default Address;
