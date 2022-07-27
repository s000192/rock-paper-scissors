import rpsCasinoAbi from "../abis/RpsCasino.json";
import { providers, Contract, BigNumber, Signer } from "ethers";
import addresses from "../constants/addresses.json";
import { ChainId } from '../data/types';
import { RpsCasino } from './types/RpsCasino';

const bet = async (provider: providers.Web3Provider, signer: Signer, choice: number, amount: BigNumber) => {
  const network = await provider.getNetwork();

  const rpsCasino = new Contract(
    addresses.rpsCasino[network.chainId.toString() as ChainId],
    rpsCasinoAbi,
    signer
  ) as RpsCasino;

  await rpsCasino.bet(choice, { value: amount });
}

export default bet;