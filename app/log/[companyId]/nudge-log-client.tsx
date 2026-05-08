"use client";

import { useState } from "react";
import Link from "next/link";
import TopLevelLink from "../TopLevelLink";
import { Button, Card, Heading, Text } from "@whop/react/components";
import { type NudgeLogRow } from "@/lib/supabase";
import { FilterIcon } from "@/components/icons";

interface NudgeLogClientProps {
	rows: NudgeLogRow[];
	companyId: string;
	manageUrlsByMemberId: Map<string, string>;
}

function getTriggerBadge(triggerType: NudgeLogRow["trigger_type"]): {
	label: string;
	className: string;
} {
	switch (triggerType) {
		case "inactive":
			return {
				label: "💤 Inactive",
				className: "bg-[#eff6ff] dark:bg-[#0f1f3d] text-[#2563eb] dark:text-[#60a5fa]",
			};
		case "canceling":
			return {
				label: "🚨 Canceling",
				className: "bg-[#fef2f2] dark:bg-[#2d0f0f] text-[#dc2626] dark:text-[#f87171]",
			};
		case "payment_failed":
			return {
				label: "💳 Payment",
				className: "bg-[#fefce8] dark:bg-[#2d2500] text-[#ca8a04] dark:text-[#fbbf24]",
			};
		default:
			return {
				label: triggerType,
				className: "bg-gray-500/20 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400",
			};
	}
}

function truncate(text: string, max = 100): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max).trimEnd()}...`;
}

function formatTimestamp(value: string): string {
	const date = new Date(value);
	const monthDay = date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
	const time = date.toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit",
	});
	return `${monthDay} · ${time}`;
}

export default function NudgeLogClient({
	rows,
	companyId,
	manageUrlsByMemberId,
}: NudgeLogClientProps) {
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
	const [showFilter, setShowFilter] = useState(false);

	const filteredRows = selectedFilter
		? rows.filter((row) => row.trigger_type === selectedFilter)
		: rows;

	const filterOptions = [
		{ value: "inactive", label: "💤 Inactive" },
		{ value: "canceling", label: "🚨 Canceling" },
		{ value: "payment_failed", label: "💳 Payment" },
	];

	return (
		<div className="min-h-screen bg-[#f5f5f5] dark:bg-[#111111] px-4 py-6 md:px-6 md:py-8">
			<div className="mx-auto w-full max-w-3xl">
				<div className="mb-6 rounded-[14px] border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)] md:p-5">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Button asChild size="2" className="gap-1.5 rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-[#ffffff] dark:bg-[#222222] px-3 text-[#555555] dark:text-[#999999]">
								<Link href={`/home/${companyId}`}>← Back</Link>
							</Button>
							<Heading size="6" className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#f0f0f0]">
								Nudges Sent
							</Heading>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative">
								<button
									onClick={() => setShowFilter(!showFilter)}
									className="h-8 w-8 flex items-center justify-center text-[#888888] hover:text-[#FA4616] transition-colors"
									aria-label="Filter nudges"
								>
									<FilterIcon className="w-5 h-5" />
								</button>
								{showFilter && (
									<div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] shadow-lg z-10">
										<button
											onClick={() => {
												setSelectedFilter(null);
												setShowFilter(false);
											}}
											className={`w-full px-4 py-2 text-left text-[13px] transition-colors ${
												selectedFilter === null
													? "text-[#FA4616] bg-[#fff8f6] dark:bg-[#2a1500]"
													: "text-[#555555] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#222222]"
											}`}
										>
											All nudges
										</button>
										{filterOptions.map((option) => (
											<button
												key={option.value}
												onClick={() => {
													setSelectedFilter(option.value);
													setShowFilter(false);
												}}
												className={`w-full px-4 py-2 text-left text-[13px] transition-colors ${
													selectedFilter === option.value
														? "text-[#FA4616] bg-[#fff8f6] dark:bg-[#2a1500]"
														: "text-[#555555] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#222222]"
												}`}
											>
												{option.label}
											</button>
										))}
									</div>
								)}
							</div>
							<Text className="rounded-full border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-2.5 py-1 text-[12px] font-semibold text-[#FA4616]">
								{filteredRows.length} sent
							</Text>
						</div>
					</div>
				</div>

				{filteredRows.length === 0 ? (
					<div className="flex min-h-[68vh] flex-col items-center justify-center rounded-[14px] border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
						<Text className="text-[48px]">📭</Text>
						<Heading size="4" className="mt-4 text-[18px] font-semibold text-[#111111] dark:text-[#f0f0f0]">
							{selectedFilter ? "No nudges found" : "Nothing sent yet"}
						</Heading>
						<Text className="mt-2 max-w-[300px] text-[14px] leading-[1.6] text-[#888888] dark:text-[#555555]">
							{selectedFilter
								? "Try a different filter to see nudges."
								: "Nudge is running in the background. When a member gets a nudge, it'll appear here."}
						</Text>
					</div>
				) : (
					<div className="space-y-3">
						{filteredRows.map((row) => {
							const badge = getTriggerBadge(row.trigger_type);
							return (
								<Card
									key={row.id}
									className="mx-1 rounded-2xl border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1">
											<div className="flex items-baseline gap-2">
												<TopLevelLink
													href={manageUrlsByMemberId.get(row.member_id) ?? `https://whop.com/company/${companyId}`}
													className="text-[14px] font-semibold text-[#111111] dark:text-[#f0f0f0] underline-offset-2 hover:underline"
												>
													@{row.username}
												</TopLevelLink>
												<Text className="text-[12px] text-[#888888] dark:text-[#555555]">
													{formatTimestamp(row.sent_at)}
												</Text>
											</div>
										</div>
										<span
											className={[
												"inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium flex-shrink-0",
												badge.className,
											].join(" ")}
										>
											{badge.label}
										</span>
									</div>

									<div className="mt-3 rounded-xl border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#f9f9f9] dark:bg-[#222222] px-3 py-2.5">
										<Text className="text-[13px] italic text-[#555555] dark:text-[#999999]">
											{truncate(row.message_sent, 100)}
										</Text>
									</div>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
