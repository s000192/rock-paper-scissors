import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { BigNumber, constants } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { useState } from 'react';
import Button from '../components/shared/Button';
import { rps } from '../constants';
import { useErrorNotification, ErrorCode } from '../contexts/ErrorNotificationContext';
import InfoBox from './shared/InfoBox'
import NumberField from './shared/NumberField'
import debug from 'debug';
import bet from '../contracts/bet';
import { useConnect } from '../contexts/ConnectContext';

const BetPanel = () => {
  const { addError } = useErrorNotification();
  const { provider, signer } = useConnect();
  const [choice, setChoice] = useState<number>();
  const [amountInput, setAmountInput] = useState('');
  const [betAmount, setBetAmount] = useState<BigNumber | undefined>();

  const handleChoiceChange = (event: SelectChangeEvent) => {
    setChoice(Number(event.target.value));
  };

  const handleInputNumberChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (!e.target.value) {
      setAmountInput('');
      setBetAmount(undefined);

      return;
    }

    let input = e.target.value;

    if (e.target.value.startsWith('0') && !e.target.value.startsWith('0.') && e.target.value !== '0') {
      input = e.target.value.slice(1);
    }

    if (e.target.value.startsWith('.')) {
      input = '0'.concat(e.target.value);
    }

    setAmountInput(input);
    setBetAmount(parseEther(e.target.value));
  };

  const handleBetClick = async () => {
    console.log("HI");
    console.log(choice);
    console.log(betAmount);
    console.log(provider);
    console.log(betAmount?.gt(0));
    if (choice != undefined && betAmount && provider && signer && betAmount?.gt(0)) {
      try {
        await bet(provider, signer, choice, betAmount)
      } catch (e: any) {
        debug(e.message);
        addError({
          code: ErrorCode.GeneralError,
          values: {
            message: e.message,
          },
        });
      }
    }
  }

  return (
    <>
      <InfoBox>Choose your hand and amount of ETH to bet:</InfoBox>
      <Select
        label="Choice"
        value={choice?.toString()}
        onChange={handleChoiceChange}
      >
        {rps.map((choice) => (<MenuItem key={choice.label} value={choice.value}>{choice.label}</MenuItem>))}
      </Select>
      <NumberField value={amountInput} onChange={handleInputNumberChange} />
      <Button onClick={handleBetClick}>Bet</Button>
    </>
  )
}

export default BetPanel