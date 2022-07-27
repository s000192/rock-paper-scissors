import '../styles/globals.css'
import type { AppProps } from 'next/app'
import BaseTemplate from "../components/templates/Base";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { ConnectProvider } from '../contexts/ConnectContext';
import { ErrorNotificationProvider } from '../contexts/ErrorNotificationContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>RPS Casino</title>
        <meta name="description" content="RPS Casino" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <ErrorNotificationProvider>
        <ConnectProvider>
          <BaseTemplate>
            <Component {...pageProps} />
          </BaseTemplate>
        </ConnectProvider>
      </ErrorNotificationProvider>
    </ThemeProvider>
  );
}

export default MyApp
