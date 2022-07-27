import { Grid } from '@mui/material';
import type { NextPage } from 'next'
import BetPanel from '../components/BetPanel';
import DashboardTable from '../components/DashboardTable';

import "../i18n";

const Home: NextPage = () => {
  return (
    <Grid container direction="row" alignItems="stretch">
      <Grid item xs>
        <BetPanel />
      </Grid>
      <Grid item xs>
        <DashboardTable />
      </Grid>
    </Grid>
  )
}

export default Home
