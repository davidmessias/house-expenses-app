"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyDropdown from "./CurrencyDropdown";
import { toCents } from "@/lib/amount";
import { Box, Button, TextField, MenuItem, Typography, Paper } from "@mui/material";

const schema = z.object({
	date: z.string(),
	kind: z.enum(["income", "expense"]),
	mode: z.string(),
	amount: z.string(),
	description: z.string().optional(),
	currency: z.string(),
});

type FormData = z.infer<typeof schema>;
type TransactionFormProps = {
	onCreated: () => void;
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onCreated }) => {
	const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			currency: "EUR",
			date: new Date().toISOString().slice(0, 10),
			kind: "expense",
			mode: "direct_debit", // default for expense
		},
	});

	const kind = watch("kind");
	const modes =
		kind === "income"
			? ["cash", "inbound_transfer", "salary"]
			: ["direct_debit", "credit_card", "transfer"];
	const direction = kind === "income" ? "credit" : "debit";

	// Ensure mode is always valid when kind changes
	// If mode is not in modes, reset to first
	const mode = watch("mode");
	if (!modes.includes(mode)) {
		setValue("mode", modes[0]);
	}

	const onSubmit = async (data: FormData) => {
		const res = await fetch("/api/transactions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				date: data.date,
				kind: data.kind,
				mode: data.mode,
				direction,
				description: data.description,
				currency: data.currency,
				amountCents: toCents(data.amount),
			}),
		});
		if (res.ok) {
			reset();
			onCreated();
		} else alert("Failed to create");
	};

	return (
			<Paper elevation={3} sx={{ maxWidth: 600, mx: "auto", p: 4, borderRadius: 3 }}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Typography variant="h5" mb={3} color="primary" fontFamily="Inter, Arial, sans-serif">
						Add Entry
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
						<Box sx={{ flex: '1 1 220px' }}>
							<TextField
								label="Date"
								type="date"
								fullWidth
								InputLabelProps={{ shrink: true }}
								{...register("date")}
							/>
						</Box>
								<Box sx={{ flex: '1 1 220px' }}>
											<TextField
												label="Kind"
												select
												fullWidth
												value={kind}
												onChange={e => setValue("kind", e.target.value as "income" | "expense")}
											>
										<MenuItem value="income">Income (credit)</MenuItem>
										<MenuItem value="expense">Expense (debit)</MenuItem>
									</TextField>
								</Box>
								<Box sx={{ flex: '1 1 220px' }}>
													<TextField
														label="Mode"
														select
														fullWidth
														value={watch("mode") || modes[0]}
														onChange={e => setValue("mode", e.target.value)}
													>
														{modes.map((m) => (
															<MenuItem key={m} value={m}>{m.replace("_", " ")}</MenuItem>
														))}
													</TextField>
								</Box>
						<Box sx={{ flex: '1 1 220px' }}>
							<TextField
								label="Amount (EUR)"
								type="number"
								inputProps={{ step: "0.01", min: "0" }}
								placeholder="0.00"
								fullWidth
								{...register("amount")}
							/>
						</Box>
						<Box sx={{ flex: '1 1 220px', mt: 2 }}>
							<CurrencyDropdown value={watch("currency")} onChange={(v) => setValue("currency", v)} />
						</Box>
						<Box sx={{ flex: '1 1 100%', mt: 2 }}>
							<TextField
								label="Description"
								placeholder="Optional note"
								fullWidth
								{...register("description")}
							/>
						</Box>
						<Box sx={{ flex: '1 1 100%', mt: 2 }}>
							<Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: "bold", fontFamily: "Inter, Arial, sans-serif" }}>
								Add
							</Button>
						</Box>
					</Box>
				</form>
			</Paper>
	);
};

export default TransactionForm;
