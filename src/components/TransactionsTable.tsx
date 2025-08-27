
'use client';
import { fromCents } from '@/lib/amount';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

type Transaction = {
  PK: string;
  SK: string;
  id?: string;
  date: string;
  kind: string;
  mode: string;
  direction: string;
  description?: string;
  currency: string;
  amountCents: number;
};

export default function TransactionsTable({ items, onChanged }: { items: Transaction[]; onChanged: () => void }) {
  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (y && m && d) return `${d}/${m}/${y}`;
    return dateStr;
  }
  async function del(sk: string, pk: string, id?: string) {
    if (!confirm('Delete entry?')) return;
    console.log(`[UI] Delete requested for transaction id: ${id}`);
    try {
      const res = await fetch(`/api/transactions/${encodeURIComponent(sk)}?pk=${encodeURIComponent(pk)}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert('Delete failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Delete failed: ' + String(e));
      console.error('Delete error:', e);
    } finally {
      onChanged(); // Always refresh UI after delete attempt
    }
  }
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2} color="primary">Transactions</Typography>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#000' }}>
            <TableCell align="left"sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Date</TableCell>
            <TableCell align="center"sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Kind</TableCell>
            <TableCell align="center"sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Mode</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Description</TableCell>
          {/*  <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Currency</TableCell> */}
            <TableCell align="right"sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Amount</TableCell>
            <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((it, idx) => (
            <TableRow
              key={it.SK || it.id || idx}
              sx={{ backgroundColor: it.direction === 'debit' ? '#fee2e2' : it.direction === 'credit' ? '#d1fae5' : undefined }}
            >
              <TableCell>{formatDate(it.date)}</TableCell>
              <TableCell>{it.kind}</TableCell>
              <TableCell>{it.mode}</TableCell>
              <TableCell>{it.description ?? ''}</TableCell>
              <TableCell align="right">{it.currency} {fromCents(it.amountCents)}</TableCell>
              <TableCell align="center">
                <IconButton onClick={() => del(it.SK, it.PK, it.id)} color="error" size="small" aria-label="Delete" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <DeleteIcon style={{ color: '#888' }} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
