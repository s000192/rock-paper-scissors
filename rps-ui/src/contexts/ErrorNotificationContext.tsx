import React, { createContext, useContext } from "react";
import { Snackbar, SnackbarContent, Slide } from "@mui/material";
import { useTranslation } from "react-i18next";

type ErrorProps = {
  addError: (e: ErrorMessage) => void;
};

export const ErrorNotificationContext = createContext<ErrorProps>({
  addError: () => { },
});

export const useErrorNotification = () => {
  const context = useContext(ErrorNotificationContext);
  return context;
};

export enum ErrorCode {
  GeneralError = "error.general",
}

type ErrorMessage = {
  code: ErrorCode;
  values?: { [key: string]: string };
  timeout?: number;
};

function TransitionComponent(props: any) {
  return <Slide {...props} direction="up" />;
}

export const ErrorNotificationProvider: React.FC = ({ children }) => {
  const { t } = useTranslation("error");
  const [error, setError] = React.useState<ErrorMessage>();
  const addError = React.useCallback((error: ErrorMessage) => {
    setError((prev) => {
      if (error.timeout) {
        setTimeout(() => {
          setError(undefined);
        }, error.timeout);
      }
      return error;
    });
  }, []);
  const value = React.useMemo(() => {
    return {
      error,
      addError,
    };
  }, [error, addError]);
  return (
    <ErrorNotificationContext.Provider value={value}>
      {error && (
        <Snackbar
          open
          TransitionComponent={TransitionComponent}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          autoHideDuration={error.timeout}
          onClose={() => setError(undefined)}
        >
          <SnackbarContent
            sx={{
              // backgroundImage: `url("./images/button.svg")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
              height: { xs: 120, sm: 102 },
              width: {
                xs: 300,
                sm: 300,
              },
              padding: (theme: any) => ({
                xs: theme.spacing(2, 6, 2.5, 6),
                sm: theme.spacing(2, 2, 2.5, 2),
              }),
              backgroundColor: "transparent",
              boxShadow: "none",
              "& .MuiSnackbarContent-message": {
                height: "100%",
                width: "100%",
                overflow: "auto",
                padding: 0,
              },
            }}
            message={t(error.code, error.values)}
          />
        </Snackbar>
      )}
      {children}
    </ErrorNotificationContext.Provider>
  );
};
