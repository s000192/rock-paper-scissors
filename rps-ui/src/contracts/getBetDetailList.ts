import rpsCasinoAbi from "../abis/RpsCasino.json";
import { providers, Contract } from "ethers";
import addresses from "../constants/addresses.json";
import { ChainId } from '../data/types';
import { RpsCasino } from './types/RpsCasino';

const getBetDetailList = async (provider: providers.Web3Provider, address: string) => {
  const network = await provider.getNetwork();

  const rpsCasino = new Contract(
    addresses.rpsCasino[network.chainId.toString() as ChainId],
    rpsCasinoAbi,
    provider
  ) as RpsCasino;

  const betList = await rpsCasino.getBetListByAddress(address);
  // TODO: use multicall
  const betDetailList = await Promise.all(betList.map((betId) => rpsCasino.betDetailById(betId)));
  const claimableAmountList = await Promise.all(betList.map((betId) => rpsCasino.checkClaimableAmount(betId)));

  return betDetailList.map((detail, index) => {
    return {
      ...detail,
      claimableAmount: claimableAmountList[index],
      betId: betList[index],
    }
  });
}

export default getBetDetailList;