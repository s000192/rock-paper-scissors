import { Box, styled, Dialog, DialogProps } from "@mui/material";
import { keyframes } from "@mui/styled-engine";

const imageUrl = `${process.env.PUBLIC_URL}/images/logo.png`;

const fading = keyframes`
0% {
  opacity: 0.2;
}

75% {
  opacity: 1;
}

100% {
  opacity: 0.2;
}
`;

const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: `${fading} 1500ms ${theme.transitions.easing.easeOut} infinite`,
}));

const Loader: React.FC<DialogProps> = ({ open }) => {
  return (
    <Dialog
      open={open}
      fullScreen
      sx={{
        "& .MuiPaper-root": {
          background: "rgba(30,30,30,.7)",
        },
      }}
    >
      <AnimatedBox
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <div>
          <img src={imageUrl} alt="loading" width={400} />
        </div>
      </AnimatedBox>
    </Dialog>
  );
};

export default Loader;
