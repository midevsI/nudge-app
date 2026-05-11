import { headers } from "next/headers";
import Link from "next/link";
import { Button, Heading } from "@whop/react/components";
import { DEFAULT_SETTINGS, type SettingsRow, supabaseRequest } from "@/lib/supabase";
import { whopsdk } from "@/lib/whop-sdk";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	await whopsdk.verifyUserToken(await headers());

	const settingsRows = await supabaseRequest<SettingsRow[]>({
		table: "settings",
		query: {
			company_id: `eq.${companyId}`,
			limit: 1,
		},
	});

	const existing = settingsRows[0];
	const initialValues = {
		inactive_days: existing?.inactive_days ?? DEFAULT_SETTINGS.inactive_days,
		inactive_message:
			existing?.inactive_message ?? DEFAULT_SETTINGS.inactive_message,
		inactive_enabled:
			existing?.inactive_enabled ?? DEFAULT_SETTINGS.inactive_enabled,
		cancel_message: existing?.cancel_message ?? DEFAULT_SETTINGS.cancel_message,
		cancel_enabled: existing?.cancel_enabled ?? DEFAULT_SETTINGS.cancel_enabled,
		payment_message:
			existing?.payment_message ?? DEFAULT_SETTINGS.payment_message,
		payment_enabled:
			existing?.payment_enabled ?? DEFAULT_SETTINGS.payment_enabled,
	};

	return (
		<div className="min-h-screen bg-[#f5f5f5] dark:bg-[#111111] px-4 py-6 md:px-6 md:py-8">
			<div className="mx-auto w-full max-w-3xl">
				<div className="mb-6 rounded-[14px] border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)] md:p-5">
					<div className="flex items-center gap-3">
					<Button
						asChild
						size="2"
						className="gap-1.5 rounded-full border border-[#e0e0e0] dark:border-[#333333] bg-[#ffffff] dark:bg-[#222222] px-3 text-[#555555] dark:text-[#999999]"
					>
						<Link href={`/dashboard/${companyId}`}>
							<span aria-hidden="true">←</span>
							<span>Back</span>
						</Link>
					</Button>
					<Heading size="6" className="text-[22px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#f0f0f0]">
						Nudge Settings
					</Heading>
					</div>
				</div>

				<SettingsForm
					companyId={companyId}
					initialValues={initialValues}
					initialTrackedCount={0}
				/>
			</div>
		</div>
	);
}
