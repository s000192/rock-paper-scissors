import React from "react";
import Container, { ContainerProps } from "@mui/material/Container";

const Content = React.forwardRef<any, ContainerProps>((props, ref) => (
  <Container maxWidth="md" {...props} {...{ ref }} />
));
export default Content;
