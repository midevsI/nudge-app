import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@whop/react/components";
import { type SettingsRow, supabaseRequest } from "@/lib/supabase";
import { whopsdk } from "@/lib/whop-sdk";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	await whopsdk.verifyUserToken(await headers());

	const settings = await supabaseRequest<SettingsRow[]>({
		table: "settings",
		query: {
			company_id: `eq.${companyId}`,
			select: "company_id",
			limit: 1,
		},
	});

	const hasSettings = settings.length > 0;

	if (hasSettings) {
		redirect(`/home/${companyId}`);
	}

	return (
		<div className="min-h-screen bg-[#f5f5f5] dark:bg-[#111111] px-4 py-10">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[760px] flex-col items-center justify-center text-center">
				<div className="inline-flex items-center rounded-full border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-3 py-1 text-[12px] font-semibold tracking-[0.08em] text-[#555555] dark:text-[#999999]">
					WELCOME TO NUDGE
				</div>

				<div className="mt-7 mx-auto h-[220px] w-auto sm:h-[250px]">
					<Image
						src="/whop-illo-telescope.svg"
						alt="Telescope illustration"
						width={290}
						height={250}
						className="h-full w-full object-contain"
						priority
					/>
				</div>

				<h1 className="mt-8 max-w-[620px] text-[28px] font-semibold tracking-[-0.025em] text-[#111111] dark:text-[#f0f0f0] sm:text-[36px]">
					Turn churn into second chances.
				</h1>
				<p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-[1.65] text-[#555555] dark:text-[#999999]">
					Nudge reaches inactive, canceling, and failed-payment members
					automatically so you recover revenue without extra manual work.
				</p>

				<Button
					asChild
					size="3"
					className="mt-8 h-12 w-full max-w-[360px] rounded-xl border border-[#FA4616] bg-[#FA4616] text-[15px] font-semibold text-white transition-colors hover:bg-[#E83D0E]"
				>
					<Link href={`/settings/${companyId}`}>Set up Nudge</Link>
				</Button>
			</div>
		</div>
	);
}
