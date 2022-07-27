import { providers, Signer } from "ethers";
import React, { createContext, useContext, useEffect, useState } from "react";
import Web3Modal, { IProviderOptions } from "web3modal";
import { useErrorNotification, ErrorCode } from "./ErrorNotificationContext";
import Debug from "debug";

export type Address = `0x${string}`;
const debug = Debug("web:connect");

const providerOptions: IProviderOptions = {};
export interface ConnectProps {
  web3Modal?: Web3Modal;
  provider?: providers.Web3Provider;
  signer?: Signer;
  block?: number;
  address?: Address;
  chainId?: number;
  isConnected: boolean;
  connect?: () => Promise<void>;
  disconnect?: () => Promise<void>;
  isLoading?: boolean;
  isChainIdCorrect?: boolean;
  switchChain?: () => void;
}

export const ConnectContext = createContext<ConnectProps>({
  isConnected: false,
});

export const useConnect = () => {
  const context = useContext(ConnectContext);

  return context;
};

const getHexademicalChainId = (chainId: number) => `0x${chainId.toString(16)}`;
const defaultDecimalChainId = parseInt(process.env.REACT_APP_CHAIN_ID || "0");

const isChainIdCorrect = (chainId?: number) => {
  if (!defaultDecimalChainId) return true;
  return (
    chainId ?
      getHexademicalChainId(chainId) ===
      getHexademicalChainId(defaultDecimalChainId) : false
  );
};

export const ConnectProvider: React.FC = ({ children }) => {
  const { addError } = useErrorNotification();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [provider, setProvider] = useState<providers.Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [block, setBlock] = useState<number>();
  const [address, setAddress] = useState<Address>();
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number>();
  const [isSigning, setIsSigning] = useState(false);

  const disconnect = React.useCallback(async () => {
    try {
      web3Modal?.clearCachedProvider();
      setAddress!(undefined);
      setProvider!(undefined);
      setIsConnected!(false);
    } catch (e: any) {
      debug(e.message);
      addError({
        code: ErrorCode.GeneralError,
        values: {
          message: e.message,
        },
      });
    }
  }, [web3Modal, addError]);

  const connect = React.useCallback(
    async (isRetainingSession: boolean = false) => {
      if (web3Modal) {
        try {
          const myModalProvider = await web3Modal.connect();
          const ethersProvider = new providers.Web3Provider(
            myModalProvider,
            "any"
          );
          const ethersSigner = ethersProvider.getSigner();
          const ethAddress = (await ethersSigner.getAddress()) as Address;
          const network = await ethersProvider.getNetwork();

          setSigner!(ethersSigner);
          setAddress!(ethAddress);
          setChainId!(network.chainId);
          setProvider!(ethersProvider);
          setIsConnected!(true);

          debug(`Connected to Chain: ${network.chainId}`);

          if (!isRetainingSession) {
            try {
              setIsSigning(true);
              setIsSigning(false);
            } catch (e: any) {
              debug(e.message);
              addError({
                code: ErrorCode.GeneralError,
                values: {
                  message: e.message,
                },
              });
              disconnect();
            } finally {
              setIsSigning(false);
            }
          }
        } catch (ex) { }
      }
    },
    [web3Modal, addError, disconnect]
  );

  const switchChain = React.useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: getHexademicalChainId(defaultDecimalChainId),
          },
        ],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // todo: wallet_addEthereumChain
      }
      return;
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      return;
    }

    const myWeb3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
    });

    setWeb3Modal(myWeb3Modal);
  }, [isConnected, setWeb3Modal]);

  useEffect(() => {
    if (!web3Modal || !web3Modal.cachedProvider) {
      return;
    }
  }, [web3Modal, setBlock, connect]);

  // listen new block
  useEffect(() => {
    if (!provider || !setBlock) {
      return undefined;
    }

    function handleNewBlock(blockNumber: number) {
      setBlock(blockNumber);
    }

    provider.on("block", handleNewBlock);

    return () => {
      provider.removeListener("block", handleNewBlock);
    };
  }, [provider, setBlock]);

  // event tracking
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        debug("provider: accounts changed");
        disconnect();
      });

      window.ethereum.on("chainChanged", (updatedChainId: string) => {
        debug("provider: chain changed", updatedChainId);
        connect(true);
      });

      window.ethereum.on("disconnect", (error: any) => {
        // Error Code 1013: Attempt to reconnect if attempting to reconnect
        // "Error: MetaMask: Disconnected from chain. Attempting to connect."
        if (error.code === 1013) {
          debug("attempt to re-connect due to provider reconnection");
          connect(true);
        } else {
          debug("provider: disconnect");
          disconnect();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [connect, disconnect]);

  const isLoading = React.useMemo(
    () => isSigning,
    [isSigning]
  );
  return (
    <ConnectContext.Provider
      value={{
        web3Modal,
        address,
        block,
        isConnected,
        chainId,
        signer,
        provider,
        connect,
        disconnect,
        isLoading,
        switchChain,
        isChainIdCorrect: isChainIdCorrect(chainId),
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};
