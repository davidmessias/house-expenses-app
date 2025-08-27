
'use client';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

type Filters = {
  month?: string;
  direction?: string;
  mode?: string;
};


export default function FiltersBar({ value, onChange }: { value: Filters; onChange: (v: Filters) => void }) {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v || undefined });
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 180px' }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Month</Typography>
          <TextField
            type="month"
            fullWidth
            value={value.month || ''}
            onChange={e => set('month', e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Direction</Typography>
          <Select
            fullWidth
            value={value.direction || ''}
            onChange={e => set('direction', e.target.value)}
            size="small"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="credit">Income</MenuItem>
            <MenuItem value="debit">Expense</MenuItem>
          </Select>
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>Mode</Typography>
          <Select
            fullWidth
            value={value.mode || ''}
            onChange={e => set('mode', e.target.value)}
            size="small"
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="cash">cash</MenuItem>
            <MenuItem value="inbound_transfer">inbound_transfer</MenuItem>
            <MenuItem value="salary">salary</MenuItem>
            <MenuItem value="direct_debit">direct_debit</MenuItem>
            <MenuItem value="credit_card">credit_card</MenuItem>
            <MenuItem value="transfer">transfer</MenuItem>
          </Select>
        </Box>
        <Box sx={{ flex: '1 1 120px', display: 'flex', alignItems: 'flex-end' }}>
          <Button variant="outlined" color="primary" fullWidth onClick={() => onChange({})} sx={{ py: 1 }}>
            Clear
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
