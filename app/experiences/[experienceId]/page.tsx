import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	// Ensure the user is logged in on whop.
	const { userId } = await whopsdk.verifyUserToken(await headers());

	// Fetch the neccessary data we want from whop.
	const [experience, user, access] = await Promise.all([
		whopsdk.experiences.retrieve(experienceId),
		whopsdk.users.retrieve(userId),
		whopsdk.users.checkAccess(experienceId, { id: userId }),
	]);

	const displayName = user.name || `@${user.username}`;

	return (
		<div className="flex flex-col p-8 gap-4 dark:bg-[#0f172a] min-h-screen">
			<div className="flex justify-between items-center gap-4">
				<h1 className="text-9 dark:text-slate-100">
					Hi <strong>{displayName}</strong>!
				</h1>
				<Link href="https://docs.whop.com/apps" target="_blank">
					<Button variant="classic" className="w-full" size="3">
						Developer Docs
					</Button>
				</Link>
			</div>

			<p className="text-3 text-gray-10 dark:text-slate-400">
				Welcome to you whop app! Replace this template with your own app. To
				get you started, here's some helpful data you can fetch from whop.
			</p>

			<h3 className="text-6 font-bold dark:text-slate-100">Experience data</h3>
			<JsonViewer data={experience} />

			<h3 className="text-6 font-bold dark:text-slate-100">User data</h3>
			<JsonViewer data={user} />

			<h3 className="text-6 font-bold dark:text-slate-100">Access data</h3>
			<JsonViewer data={access} />
		</div>
	);
}

function JsonViewer({ data }: { data: any }) {
	return (
		<pre className="text-2 border border-gray-a4 dark:border-slate-600 rounded-lg p-4 bg-gray-a2 dark:bg-slate-800 dark:text-slate-300 max-h-72 overflow-y-auto">
			<code className="text-gray-10 dark:text-slate-300">{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}
