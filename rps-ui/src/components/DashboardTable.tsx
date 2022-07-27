import { Paper, Table, TableHead, styled, TableContainer, TableRow, TableCell, TableBody, TableCellProps as MuiTableCellProps } from "@mui/material";
import { useConnect } from "../contexts/ConnectContext";
import { BigNumber, Contract, utils } from "ethers";
import rpsCasinoAbi from "../abis/RpsCasino.json";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import addresses from "../constants/addresses.json";
import { ChainId } from '../data/types';
import { rps } from '../constants';
import { formatEther } from 'ethers/lib/utils';
import getBetDetailList from '../contracts/getBetDetailList';
import Button from './shared/Button';

interface Column {
  id: 'claimableAmount' | 'betId' | 'amount' | 'bettorChoice' | 'platformChoice';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: ((value: number) => string) | ((value: number | null) => string) | ((value: BigNumber) => string);
}

const columns: Column[] = [
  { id: 'betId', label: 'Bet ID', minWidth: 100, format: (value: BigNumber) => value.toString() },
  { id: 'amount', label: 'Amount (ETH)', minWidth: 70, format: (value: BigNumber) => formatEther(value) },
  {
    id: 'bettorChoice',
    label: 'Your choice',
    minWidth: 70,
    align: 'right',
    format: (value: number) => rps.find((choice) => choice.value === value)?.label || '',
  },
  {
    id: 'platformChoice',
    label: "Platform's Choice",
    minWidth: 70,
    align: 'right',
    format: (value: number | null) => rps.find((choice) => choice.value === value)?.label || 'Not ready',
  },
  { id: 'claimableAmount', label: 'Claim Amount (ETH)', minWidth: 100, format: (value: BigNumber) => formatEther(value) },
];

interface Data {
  betId: BigNumber;
  index: number;
  amount: BigNumber;
  bettorChoice: number;
  platformChoice: number | null;
  claimableAmount: BigNumber;
}

const StyledTableCell = styled(TableCell)<MuiTableCellProps>(({ theme }) => ({
  "&.MuiTableCell-root": {
    color: "#000",
  },
}));

const DashboardTable = () => {
  const { t } = useTranslation();
  const { provider, signer, address, chainId } = useConnect();
  const [rpsCasino, setRpsCasino] = useState<Contract>();
  const [betDetailList, setBetDetailList] = useState<Array<Data>>([]);

  useEffect(() => {
    if (rpsCasino || !signer || !chainId) return;

    setRpsCasino(
      new Contract(
        addresses.rpsCasino[chainId.toString() as ChainId],
        rpsCasinoAbi,
        signer
      )
    );
  }, [signer, chainId, rpsCasino]);

  useEffect(() => {
    if (!rpsCasino || !provider || !address) return;

    (async () => {
      const betDetailList = (await getBetDetailList(provider, address)).map((detail, index) => {
        const { betId, amount, bettorChoice, platformChoice, platformChoiceReady, claimableAmount } = detail
        return {
          index,
          betId,
          amount,
          bettorChoice,
          platformChoice: platformChoiceReady ? platformChoice : null,
          claimableAmount
        }
      });

      console.log(betDetailList);
      setBetDetailList(betDetailList);
    })();
  }, [rpsCasino, address, provider]);

  const handleClaimClick = async (betId: BigNumber) => {
    if (!rpsCasino || !signer) {
      return;
    }

    try {
      await rpsCasino.claimBet(betId)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left" colSpan={5}>
                {t("bet:bet_details")}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 57, minWidth: column.minWidth }}
                >
                  {column.label}
                </StyledTableCell>
              ))
              }
            </TableRow >
          </TableHead >
          <TableBody>
            {betDetailList.map((betDetail) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={betDetail.index}>
                  {columns.map((column) => {
                    const value = betDetail[column.id];
                    return (
                      <StyledTableCell key={column.id} align={column.align}>
                        {column.format
                          ? column.format(value as any)
                          : value}
                        {column.id === "claimableAmount" && typeof value === "object" && value?.gt(0)
                          ? <Button
                            onClick={() => handleClaimClick(betDetail["betId"])}
                          >{t("bet:claim")}</Button> :
                          <></>
                        }
                      </StyledTableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody >
        </Table >
      </TableContainer >
    </Paper >
  )
}

export default DashboardTable