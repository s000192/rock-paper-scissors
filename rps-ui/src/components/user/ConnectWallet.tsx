import { useConnect } from "../../contexts/ConnectContext";
import Button from "../shared/Button";
import UserAddress from "../shared/UserAddress";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

const ConnectWallet = () => {
  const { isConnected, disconnect, connect, address } = useConnect();
  const { t } = useTranslation();

  if (isConnected) {
    return (
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <UserAddress address={address} />
        <Button onClick={disconnect} role="button" aria-label="disconnect">
          {t("user:connect_wallet.disconnect")}
        </Button>
      </Box>
    );
  }
  return (
    <Button
      onClick={() => connect ? connect() : {}}
      role="button"
      aria-label="connect"
      sx={{ height: 80, width: 200 }}
    >
      {t("user:connect_wallet.connect")}
    </Button>
  );
};
export default ConnectWallet;
