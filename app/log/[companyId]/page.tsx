import { headers } from "next/headers";
import NudgeLogClient from "./nudge-log-client";
import { type NudgeLogRow, supabaseRequest } from "@/lib/supabase";
import { whopsdk } from "@/lib/whop-sdk";

export default async function NudgeLogPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	await whopsdk.verifyUserToken(await headers());

	const rows = await supabaseRequest<NudgeLogRow[]>({
		table: "nudge_log",
		query: {
			company_id: `eq.${companyId}`,
			order: "sent_at.desc",
		},
	});

	const memberIds = Array.from(new Set(rows.map((row) => row.member_id)));
	const manageUrlEntries = await Promise.all(
		memberIds.map(async (memberId) => {
			try {
				const member = await whopsdk.members.retrieve(memberId);
				const manageUrl = (member as { manage_url?: string | null }).manage_url;
				return [memberId, manageUrl ?? `https://whop.com/company/${companyId}`] as const;
			} catch {
				return [memberId, `https://whop.com/company/${companyId}`] as const;
			}
		}),
	);
	const manageUrlsByMemberId = new Map(manageUrlEntries);

	return (
		<NudgeLogClient
			rows={rows}
			companyId={companyId}
			manageUrlsByMemberId={manageUrlsByMemberId}
		/>
	);
}
