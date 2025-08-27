"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)' }}>
      <Paper elevation={6} sx={{ p: 5, borderRadius: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} color="primary" mb={2}>
          Home Finance App
        </Typography>
        <Typography variant="h5" fontWeight={500} mb={2}>
          {/*Welcome*/}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Login with your credentials to access your finance dashboard.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 2, boxShadow: 2 }}
          onClick={() => signIn("cognito", { callbackUrl })}
        >
          Sign in
        </Button>
      </Paper>
    </Box>
  );
}
