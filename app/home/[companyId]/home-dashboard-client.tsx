"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, Text } from "@whop/react/components";
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
		<div className="min-h-screen bg-[#f5f5f5] dark:bg-[#111111] pb-10">
			<div className="mx-auto w-full">
			<Toast
				message={toastState.message}
				type={toastState.type}
				visible={toastState.visible}
			/>

			<div className="flex justify-end items-center gap-3 pr-5 pt-5">
					<Link
						href={`/log/${companyId}`}
						className="text-[13px] font-medium text-[#FA4616] hover:underline underline-offset-2"
					>
						View sent nudges →
					</Link>
					<Link
						href={`/settings/${companyId}`}
						aria-label="Settings"
						className="text-[16px] text-[#888888] hover:text-[#FA4616] transition-colors"
					>
						⚙️
					</Link>
				</div>
			</div>

			<div className="px-4 pt-5 pb-6 sm:px-6">
				<Text className="pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#888888] dark:text-[#555555]">
					Active Nudges
				</Text>

				<div className="space-y-3">
				{cards.map((card) => (
					<Card
						key={card.key}
						className="rounded-[14px] border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
					>
						{confirmingDelete === card.key ? (
							<div>
								<Text className="text-[14px] text-[#111111] dark:text-[#f0f0f0]">Delete this nudge?</Text>
								<div className="mt-3 flex gap-2">
									<Button
										type="button"
										variant="soft"
										onClick={() => setConfirmingDelete(null)}
										className="h-8 rounded-md border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#222222] px-3 text-xs text-[#555555] dark:text-[#999999]"
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
											className="h-8 w-8 min-w-8 rounded-lg border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-0 text-[#888888] dark:text-[#555555] transition-colors duration-200 hover:text-[#FA4616]"
											asChild
										>
											<Link href={`/edit/${companyId}?trigger=${card.key}`}>
												<PencilIcon className="w-4 h-4" />
											</Link>
										</Button>
										<Button
											type="button"
											variant="ghost"
											className="h-8 w-8 min-w-8 rounded-lg border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-0 text-[#888888] dark:text-[#555555] transition-colors duration-200 hover:text-[#ef4444]"
											onClick={() => setConfirmingDelete(card.key)}
										>
											<TrashIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>

								<div className="mt-2 rounded-xl bg-[#f9f9f9] dark:bg-[#222222] px-3 py-2.5 text-left">
									<Text className="text-[13px] italic text-[#555555] dark:text-[#999999]">
										{card.message ? truncateMessage(card.message, 80) : "No message configured..."}
									</Text>
								</div>

								<div className="mt-2.5 flex items-center justify-between">
									<Text className="text-[12px] text-[#888888] dark:text-[#555555]">
										{card.key === "inactive" ? `Sends after ${card.days ?? "-"} days` : ""}
									</Text>
									<div className="flex items-center gap-1.5">
										<span
											className={[
												"h-2 w-2 rounded-full",
												card.enabled
													? "bg-[#22c55e] dark:bg-green-600"
													: "bg-[#d1d5db] dark:bg-[#444444]",
											].join(" ")}
										/>
										<Text
											className={card.enabled ? "text-[12px] font-medium text-[#22c55e]" : "text-[12px] text-[#888888] dark:text-[#555555]"}
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
				<div className="mt-4 rounded-xl border border-[#fde8e0] dark:border-[#3a2000] bg-[#fff8f6] dark:bg-[#2a1500] p-4">
					<Text className="text-center text-[13px] text-[#FA4616]">
						All nudges are paused. Edit a nudge to reactivate.
					</Text>
				</div>
			) : null}
			</div>
		</div>
	);
}
