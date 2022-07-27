import { Dialog, styled } from "@mui/material";

export default styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 1,
    boxShadow: theme.shadows[18],
    background: "#fff;",
    // backgroundImage: `url("./images/mooning.png"), linear-gradient(to bottom right, #78A2AA, #000000)`,
    position: "relative",
  },
}));
