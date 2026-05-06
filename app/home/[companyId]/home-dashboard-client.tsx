"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, Heading, Text } from "@whop/react/components";
import { Toast } from "@/components/toast";
import { PencilIcon, TrashIcon } from "@/components/icons";
import type { SettingsRow } from "@/lib/supabase";

type TriggerKey = "inactive" | "canceling" | "payment";

type TriggerCardState = {
	key: TriggerKey;
	icon: string;
	title: string;
	message: string;
	enabled: boolean;
	days?: number | null;
};

function truncateMessage(message: string, max = 80): string {
	if (message.length <= max) return message;
	return `${message.slice(0, max).trimEnd()}...`;
}

export function HomeDashboardClient({
	companyId,
	initialSettings,
	initialToast,
}: {
	companyId: string;
	initialSettings: SettingsRow | null;
	initialToast?: string;
}) {
	const [settings, setSettings] = useState<SettingsRow | null>(initialSettings);
	const [deletedCards, setDeletedCards] = useState<Set<TriggerKey>>(new Set());
	const [confirmingDelete, setConfirmingDelete] = useState<TriggerKey | null>(null);
	const [isDeleting, setIsDeleting] = useState<TriggerKey | null>(null);
	const [toastState, setToastState] = useState<{
		visible: boolean;
		type: "success" | "error";
		message: string;
	}>(() => {
		if (initialToast === "updated") {
			return {
				visible: true,
				type: "success",
				message: "✓ Nudge updated successfully",
			};
		}
		if (initialToast === "deleted") {
			return {
				visible: true,
				type: "success",
				message: "Nudge deleted",
			};
		}
		return {
			visible: false,
			type: "success",
			message: "",
		};
	});

	const cards = useMemo<TriggerCardState[]>(() => {
		if (!settings) return [];
		const nextCards: TriggerCardState[] = [
			{
				key: "inactive",
				icon: "💤",
				title: "Inactive Members",
				message: settings.inactive_message ?? "",
				enabled: Boolean(settings.inactive_enabled),
				days: settings.inactive_days,
			},
			{
				key: "canceling",
				icon: "🚨",
				title: "Canceling Members",
				message: settings.cancel_message ?? "",
				enabled: Boolean(settings.cancel_enabled),
			},
			{
				key: "payment",
				icon: "💳",
				title: "Failed Payments",
				message: settings.payment_message ?? "",
				enabled: Boolean(settings.payment_enabled),
			},
		];

		return nextCards.filter((card) => {
			const hiddenByDeleteAction = deletedCards.has(card.key);
			const hiddenByStoredDeleteState = !card.enabled && card.message.trim().length === 0;
			return !hiddenByDeleteAction && !hiddenByStoredDeleteState;
		});
	}, [settings, deletedCards]);

	const allPaused = cards.length > 0 && cards.every((card) => !card.enabled);

	async function deleteTrigger(trigger: TriggerKey) {
		setIsDeleting(trigger);
		try {
			const body: Record<string, unknown> = { company_id: companyId };
			if (trigger === "inactive") {
				body.inactive_enabled = false;
				body.inactive_message = "";
				body.inactive_days = settings?.inactive_days ?? 7;
			}
			if (trigger === "canceling") {
				body.cancel_enabled = false;
				body.cancel_message = "";
			}
			if (trigger === "payment") {
				body.payment_enabled = false;
				body.payment_message = "";
			}

			const response = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const responseData = await response.text();
			
			if (!response.ok) {
				console.error("Delete API error:", response.status, responseData);
				throw new Error(`Failed to delete nudge (${response.status})`);
			}

			setSettings((prev) => {
				if (!prev) return prev;
				if (trigger === "inactive") {
					return {
						...prev,
						inactive_enabled: false,
						inactive_message: "",
						inactive_days: prev.inactive_days,
					};
				}
				if (trigger === "canceling") {
					return {
						...prev,
						cancel_enabled: false,
						cancel_message: "",
					};
				}
				return {
					...prev,
					payment_enabled: false,
					payment_message: "",
				};
			});

			setToastState({ visible: true, type: "success", message: "Nudge deleted" });
			setDeletedCards((prev) => {
				const next = new Set(prev);
				next.add(trigger);
				return next;
			});
			setConfirmingDelete(null);
		} catch (error) {
			console.error("Delete failed:", error);
			setToastState({ visible: true, type: "error", message: "Failed to delete nudge" });
		} finally {
			setIsDeleting(null);
		}
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f2f4f6] dark:bg-black pb-10">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-16 top-4 h-56 w-56 rounded-full bg-[#FA4616]/12 dark:bg-[#FA4616]/3 blur-2xl" />
				<div className="absolute -right-20 top-28 h-72 w-72 rounded-full bg-[#0f172a]/6 dark:hidden blur-2xl" />
			</div>

			<div className="relative mx-auto w-full">
			<Toast
				message={toastState.message}
				type={toastState.type}
				visible={toastState.visible}
			/>

			<div className="border-b border-[#e2e8f0] dark:border-gray-800 bg-white/55 dark:bg-black">
				<div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
					<div>
						<Heading size="6" className="text-[27px] font-semibold tracking-[-0.02em] text-[#0f172a] dark:text-white">
							Nudge
						</Heading>
						<Text className="mt-1 text-[14px] text-[#526070] dark:text-gray-500">
							Your retention engine is running on autopilot.
						</Text>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							asChild
							size="2"
							className="h-10 rounded-lg border border-white/70 dark:border-gray-700 bg-white/75 dark:bg-gray-900 px-3.5 text-[13px] font-medium text-[#334155] dark:text-gray-300 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5"
						>
							<Link href={`/settings/${companyId}`}>Settings</Link>
						</Button>
						<Button
							asChild
							size="2"
							className="h-10 rounded-lg border border-white/40 dark:border-orange-600 bg-[linear-gradient(135deg,#ff6a3d,#FA4616)] dark:bg-[#FA4616] px-4 text-[13px] font-semibold text-white shadow-[0_12px_28px_rgba(250,70,22,0.35)] dark:shadow-[0_4px_12px_rgba(250,70,22,0.3)] transition-all duration-200 hover:-translate-y-0.5 dark:hover:bg-[#E83D0E]"
						>
							<Link href={`/log/${companyId}`}>View sent nudges</Link>
						</Button>
					</div>
				</div>
			</div>

			<div className="px-4 py-6 sm:px-6">
				<Text className="pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b] dark:text-gray-600">
					Active Nudges
				</Text>

				<div className="space-y-3">
				{cards.map((card) => (
					<Card
						key={card.key}
						className="rounded-[18px] border border-white/80 dark:border-gray-800 bg-white/82 dark:bg-gray-950 p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
					>
						{confirmingDelete === card.key ? (
							<div>
								<Text className="text-[14px] text-[#111111] dark:text-white">Delete this nudge?</Text>
								<div className="mt-3 flex gap-2">
									<Button
										type="button"
										variant="soft"
										onClick={() => setConfirmingDelete(null)}
										className="h-8 rounded-md border border-zinc-300 dark:border-gray-700 px-3 text-xs text-zinc-700 dark:text-gray-300 dark:bg-gray-900"
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={() => void deleteTrigger(card.key)}
										disabled={isDeleting === card.key}
										className="h-8 rounded-md bg-[#ef4444] dark:bg-red-700 px-3 text-xs font-medium text-white"
									>
										Delete
									</Button>
								</div>
							</div>
						) : (
							<>
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-2 text-[15px] font-semibold text-[#111111] dark:text-white">
										<span>{card.icon}</span>
										<span>{card.title}</span>
									</div>
									<div className="flex items-center gap-1">
										<Button
											type="button"
											variant="ghost"
												className="h-8 w-8 min-w-8 rounded-lg border border-white/60 dark:border-gray-800 bg-white/85 dark:bg-gray-900 p-0 text-[#888888] dark:text-gray-500 shadow-[0_6px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:text-[#FA4616] hover:bg-[#fff5ed] dark:hover:text-orange-400 dark:hover:bg-gray-800"
											asChild
										>
											<Link href={`/edit/${companyId}?trigger=${card.key}`}>
												<PencilIcon className="w-4 h-4" />
											</Link>
										</Button>
										<Button
											type="button"
											variant="ghost"
											className="h-8 w-8 min-w-8 rounded-lg border border-white/60 dark:border-gray-800 bg-white/85 dark:bg-gray-900 p-0 text-[#888888] dark:text-gray-500 shadow-[0_6px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:text-[#ef4444] hover:bg-[#fef2f2] dark:hover:text-red-400 dark:hover:bg-gray-800"
											onClick={() => setConfirmingDelete(card.key)}
										>
											<TrashIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>

								<div className="mt-2 rounded-xl bg-[#f8fafc] dark:bg-gray-900 px-3 py-2.5 text-left">
									<Text className="text-[13px] italic text-[#555555] dark:text-gray-500">
										{card.message ? truncateMessage(card.message, 80) : "No message configured..."}
									</Text>
								</div>

								<div className="mt-2.5 flex items-center justify-between">
									<Text className="text-[12px] text-[#888888] dark:text-gray-600">
										{card.key === "inactive" ? `Sends after ${card.days ?? "-"} days` : ""}
									</Text>
									<div className="flex items-center gap-1.5">
										<span
											className={[
												"h-2 w-2 rounded-full",
												card.enabled
													? "bg-[#22c55e] dark:bg-green-600"
													: "bg-[#d1d5db] dark:bg-gray-700",
											].join(" ")}
										/>
										<Text
											className={card.enabled ? "text-[12px] font-medium text-[#22c55e] dark:text-green-500" : "text-[12px] text-[#9ca3af] dark:text-gray-600"}
										>
											{card.enabled ? "Live" : "Paused"}
										</Text>
									</div>
								</div>
							</>
						)}
					</Card>
				))}
			</div>

			{allPaused ? (
				<div className="mt-4 rounded-xl border border-[#fed7aa] dark:border-orange-900/40 bg-[#fff7ed] dark:bg-orange-950/10 p-4">
					<Text className="text-center text-[13px] text-[#FA4616] dark:text-orange-500">
						All nudges are paused. Edit a nudge to reactivate.
					</Text>
				</div>
			) : null}
				</div>
			</div>
		</div>
	);
}
