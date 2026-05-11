"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Button,
	Card,
	Heading,
	Select,
	Spinner,
	Switch,
	Text,
	TextArea,
} from "@whop/react/components";
import type { SettingsRow } from "@/lib/supabase";

type FormState = Pick<
	SettingsRow,
	| "inactive_days"
	| "inactive_message"
	| "inactive_enabled"
	| "cancel_message"
	| "cancel_enabled"
	| "payment_message"
	| "payment_enabled"
>;

export function SettingsForm({
	companyId,
	initialValues,
	initialTrackedCount,
}: {
	companyId: string;
	initialValues: FormState;
	initialTrackedCount: number;
}) {
	const router = useRouter();
	const [values, setValues] = useState<FormState>(initialValues);
	const [isSaving, setIsSaving] = useState(false);
	const [isSyncing, setIsSyncing] = useState(true);
	const [trackedCount, setTrackedCount] = useState(initialTrackedCount);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const scheduleSync =
			typeof window.requestIdleCallback === "function"
				? (callback: () => void) => window.requestIdleCallback(callback)
				: (callback: () => void) => window.setTimeout(callback, 250);
		async function syncMembers() {
			try {
				const response = await fetch("/api/sync-members", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ company_id: companyId }),
				});
				if (!response.ok) {
					throw new Error("Unable to sync members");
				}

				const result = (await response.json()) as { synced_count?: number };
				if (isMounted && typeof result.synced_count === "number") {
					setTrackedCount((prev) => Math.max(prev, result.synced_count ?? prev));
				}
			} catch (syncError) {
				console.error(syncError);
			} finally {
				if (isMounted) {
					setIsSyncing(false);
				}
			}
		}

		scheduleSync(() => {
			void syncMembers();
		});
		return () => {
			isMounted = false;
		};
	}, [companyId]);

	const inactiveCount = useMemo(
		() => values.inactive_message.trim().length,
		[values.inactive_message],
	);
	const cancelCount = useMemo(
		() => values.cancel_message.trim().length,
		[values.cancel_message],
	);
	const paymentCount = useMemo(
		() => values.payment_message.trim().length,
		[values.payment_message],
	);

	async function saveSettings() {
		setIsSaving(true);
		setError(null);
		try {
			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ company_id: companyId, ...values }),
			});

			if (!response.ok) {
				throw new Error("Unable to save settings");
			}

			router.push(`/success/${companyId}`);
		} catch (saveError) {
			console.error(saveError);
			setError("Could not save your settings. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-[#fde8e0] dark:border-[#3a2000] bg-[#fff8f6] dark:bg-[#2a1500] px-4 py-3">
				<Text size="2" weight="medium" className="text-[#FA4616] dark:text-orange-500">
					Write like a human. Keep it short, warm, and clear.
				</Text>
				<Text size="1" color="gray" className="mt-1 text-[#555555] dark:text-[#999999]">
					Personalized messages usually perform better than generic reminders.
				</Text>
			</div>

			<TriggerCard
				title="💤 Inactive Members"
				description="Sent when a member hasn't been active for a while"
				enabled={values.inactive_enabled}
				onToggle={(enabled) =>
					setValues((prev) => ({ ...prev, inactive_enabled: enabled }))
				}
			>
				<div className="space-y-3 rounded-lg border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-3 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
					<div className="flex flex-wrap items-center gap-3">
						<Text
							size="1"
							weight="bold"
							className="uppercase tracking-[0.08em] text-[#888888] dark:text-[#555555]"
						>
							Send after
						</Text>
						<div className="w-[140px]">
						<Select.Root
						value={String(values.inactive_days)}
						onValueChange={(nextValue) =>
							setValues((prev) => ({
								...prev,
								inactive_days: Number(nextValue),
							}))
						}
						>
							<Select.Trigger className="bg-[#ffffff] dark:bg-[#222222] text-[#111111] dark:text-[#f0f0f0] border-[#e0e0e0] dark:border-[#333333]" />
							<Select.Content>
								<Select.Item value="3">3 days</Select.Item>
								<Select.Item value="7">7 days</Select.Item>
								<Select.Item value="14">14 days</Select.Item>
								<Select.Item value="30">30 days</Select.Item>
							</Select.Content>
						</Select.Root>
						</div>
					</div>
				</div>
				<MessageField
					label="Message"
					value={values.inactive_message}
					onChange={(next) =>
						setValues((prev) => ({ ...prev, inactive_message: next.slice(0, 160) }))
					}
					placeholder="Hey [username], we miss you! Come check out what's new..."
					count={inactiveCount}
				/>
			</TriggerCard>

			<TriggerCard
				title="🚨 Canceling Members"
				description="Sent when a member has scheduled their cancellation but is still subscribed - your last chance to save them"
				enabled={values.cancel_enabled}
				onToggle={(enabled) =>
					setValues((prev) => ({ ...prev, cancel_enabled: enabled }))
				}
			>
				<MessageField
					label="Message"
					value={values.cancel_message}
					onChange={(next) =>
						setValues((prev) => ({ ...prev, cancel_message: next.slice(0, 160) }))
					}
					placeholder="Hey [username], we noticed you're leaving. We'd hate to see you go - reply here and let us know how we can help."
					count={cancelCount}
				/>
			</TriggerCard>

			<TriggerCard
				title="💳 Failed Payments"
				description="Sent when a member's payment fails - many don't even know their card declined"
				enabled={values.payment_enabled}
				onToggle={(enabled) =>
					setValues((prev) => ({ ...prev, payment_enabled: enabled }))
				}
			>
				<MessageField
					label="Message"
					value={values.payment_message}
					onChange={(next) =>
						setValues((prev) => ({ ...prev, payment_message: next.slice(0, 160) }))
					}
					placeholder="Hey [username], your payment didn't go through. Update your billing here: [billing link] so you don't lose access."
					count={paymentCount}
				/>
			</TriggerCard>

			{isSyncing ? (
				<div className="inline-flex items-center gap-2 rounded-full border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
					<Spinner loading size="1" />
					<Text color="gray" size="2" className="text-[#555555] dark:text-[#999999]">
						Syncing members...
					</Text>
				</div>
			) : (
				<div className="inline-flex items-center gap-2 rounded-full border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
					<Text color="gray" size="2" className="text-[#555555] dark:text-[#999999]">
						{`${trackedCount} members currently being tracked`}
					</Text>
				</div>
			)}

			{error ? (
				<Text size="2" color="red" className="dark:text-red-500">
					{error}
				</Text>
			) : null}

			<Button
				type="button"
				onClick={saveSettings}
				disabled={isSaving}
				size="3"
				className="h-12 w-full rounded-xl border border-[#FA4616] bg-[#FA4616] text-[15px] font-semibold text-white transition-colors hover:bg-[#E83D0E]"
			>
				<Spinner loading={isSaving} size="1">
					{isSaving ? "Saving..." : "Save & Activate Nudge"}
				</Spinner>
			</Button>
		</div>
	);
}

function TriggerCard({
	title,
	description,
	enabled,
	onToggle,
	children,
}: {
	title: string;
	description: string;
	enabled: boolean;
	onToggle: (value: boolean) => void;
	children: React.ReactNode;
}) {
	return (
		<Card className="rounded-[14px] border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<Heading size="4" className="leading-tight text-[#111111] dark:text-[#f0f0f0]">
						{title}
					</Heading>
					<Text size="2" color="gray" className="mt-1.5 max-w-2xl leading-6 text-[#555555] dark:text-[#999999]">
						{description}
					</Text>
				</div>
				<div className="flex flex-col items-end gap-1">
					<Switch checked={enabled} onCheckedChange={onToggle} />
					<Text
						size="1"
						weight="medium"
						className={enabled ? "text-[#22c55e]" : "text-[#888888] dark:text-[#555555]"}
					>
						{enabled ? "Enabled" : "Paused"}
					</Text>
				</div>
			</div>
			<div className="mt-5 space-y-4 border-t border-[#eeeeee] dark:border-[#2a2a2a] pt-4">{children}</div>
		</Card>
	);
}

function MessageField({
	label,
	value,
	onChange,
	placeholder,
	count,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	count: number;
}) {
	const countTone =
		count >= 150
			? "text-red-600 dark:text-red-500"
			: count >= 120
				? "text-amber-600 dark:text-amber-500"
				: "text-[#888888] dark:text-[#555555]";

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-3">
				<Text size="1" weight="bold" className="uppercase tracking-[0.08em] text-[#888888] dark:text-[#555555]">
				{label}
				</Text>
				<Text size="1" className={countTone}>
					{count}/160
				</Text>
			</div>
			<TextArea
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				maxLength={160}
				rows={4}
				className="leading-6 bg-[#ffffff] dark:bg-[#222222] text-[#111111] dark:text-[#f0f0f0] border-[#e0e0e0] dark:border-[#333333]"
			/>
			<Text size="1" color="gray" className="leading-5 text-[#555555] dark:text-[#999999]">
				Use [username] to personalize and keep the tone conversational.
			</Text>
		</div>
	);
}
