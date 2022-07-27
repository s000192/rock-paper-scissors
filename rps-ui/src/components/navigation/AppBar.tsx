import { Box } from "@mui/material";
import ConnectWallet from "../user/ConnectWallet";

const AppBar = () => {
  return (
    <Box display="flex">
      <Box flex={1} />
      <Box>
        <ConnectWallet />
      </Box>
    </Box>
  );
};
export default AppBar;
