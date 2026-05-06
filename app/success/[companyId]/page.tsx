import Image from "next/image";
import Link from "next/link";
import { Button } from "@whop/react/components";

export default async function SuccessPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;

	return (
		<div className="min-h-screen bg-[#f5f5f5] dark:bg-[#111111] px-4 py-10 text-center">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[540px] items-center justify-center">
				<div className="w-full rounded-[16px] border border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c] p-7 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)] sm:p-9">
					<Image
						src="/thumbsup.svg"
						alt="Thumbs up illustration"
						width={180}
						height={180}
						className="mx-auto h-[180px] w-auto"
						priority
					/>

					<h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#f0f0f0]">
						Nudge is running.
					</h1>
					<p className="mx-auto mt-3 max-w-[360px] text-[15px] leading-[1.65] text-[#555555] dark:text-[#999999]">
						We&apos;re watching your members in the background. You&apos;ll never lose one without a
						fight.
					</p>

					<Button
						asChild
						size="3"
						className="mt-8 h-12 w-full rounded-xl border border-[#FA4616] bg-[#FA4616] text-[15px] font-semibold text-white transition-colors hover:bg-[#E83D0E]"
					>
						<Link href={`/home/${companyId}`}>Go to Dashboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
