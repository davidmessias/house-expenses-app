

import { fromCents } from '@/lib/amount';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function SummaryCards({ income, expense, balance }: { income: number; expense: number; balance: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 220 }}>
        <Typography variant="subtitle2" color="text.secondary">Income</Typography>
        <Typography variant="h5" fontWeight={600} mt={1}>
          € {fromCents(income)}
        </Typography>
      </Paper>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 220 }}>
        <Typography variant="subtitle2" color="text.secondary">Expense</Typography>
        <Typography variant="h5" fontWeight={600} mt={1}>
          € {fromCents(expense)}
        </Typography>
      </Paper>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 220 }}>
        <Typography variant="subtitle2" color="text.secondary">Balance</Typography>
        <Typography
          variant="h5"
          fontWeight={700}
          mt={1}
          sx={{
            color:
              balance > 0
                ? '#16a34a'
                : balance < 0
                ? '#dc2626'
                : '#000000',
          }}
        >
          € {fromCents(balance)}
        </Typography>
      </Paper>
    </Box>
  );
}
