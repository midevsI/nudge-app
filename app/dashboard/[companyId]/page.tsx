import { headers } from "next/headers";
import Image from "next/image";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@whop/react/components";
import { type SettingsRow, supabaseRequest } from "@/lib/supabase";
import { whopsdk } from "@/lib/whop-sdk";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["600"],
});

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
		<div className="h-[100dvh] overflow-hidden bg-[#f5f5f5] dark:bg-[#111111] px-4">
			<div className="mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-center text-center">
				<div className="inline-flex items-center rounded-full border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#555555] dark:text-[#999999]">
					WELCOME TO NUDGE
				</div>

				<div className="mt-5 mx-auto h-[205px] w-auto sm:h-[235px]">
					<Image
						src="/engagement.svg"
						alt="Engagement illustration"
						width={440}
						height={504}
						className="h-full w-full object-contain"
						priority
					/>
				</div>

				<h1
					className={`${poppins.className} mt-6 max-w-[520px] text-[25px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#f0f0f0] sm:text-[31px]`}
				>
					Let&apos;s bring <span className="text-[#FA4616]">members</span> back
				</h1>
				<p className="mt-2 text-[14px] text-[#555555] dark:text-[#999999]">
					Recover more revenue on autopilot.
				</p>

				<Button
					asChild
					size="3"
					className="mt-6 h-12 w-full max-w-[340px] rounded-xl border border-[#FA4616] bg-[#FA4616] text-[15px] font-semibold text-white transition-colors hover:bg-[#E83D0E]"
				>
					<Link href={`/settings/${companyId}`}>Start setup</Link>
				</Button>
			</div>
		</div>
	);
}
