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

	return (
		<NudgeLogClient
			rows={rows}
			companyId={companyId}
			manageUrlsByMemberId={new Map()}
		/>
	);
}
