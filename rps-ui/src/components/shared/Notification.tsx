import React from "react";
import { Snackbar, SnackbarProps, Slide } from "@mui/material";
import FramedBox from "./FramedBox";

function TransitionComponent(props: any) {
  return <Slide {...props} direction="down" />;
}

const Notification = ({
  message,
  ...props
}: SnackbarProps & { message: React.ReactNode }) => (
  <Snackbar
    anchorOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    TransitionComponent={TransitionComponent}
    {...props}
  >
    <div>
      <FramedBox color="green" p={2} minWidth={300}>
        {message}
      </FramedBox>
    </div>
  </Snackbar>
);

export default Notification;
