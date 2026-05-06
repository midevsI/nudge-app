"use client";

import { useEffect, useState } from "react";
import { Text } from "@whop/react/components";

type ToastType = "success" | "error";

export function Toast({
	message,
	type,
	visible,
}: {
	message: string;
	type: ToastType;
	visible: boolean;
}) {
	const [isShown, setIsShown] = useState(false);

	useEffect(() => {
		if (!visible) {
			setIsShown(false);
			return;
		}

		setIsShown(true);
		const timer = setTimeout(() => {
			setIsShown(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, [visible]);

	return (
		<div
			className={[
				"pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-300",
				isShown ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
			].join(" ")}
		>
			<div
				className={[
					"flex items-center gap-2 rounded-xl border px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]",
					type === "success"
						? "border-[#eeeeee] dark:border-[#2a2a2a] bg-[#ffffff] dark:bg-[#1c1c1c]"
						: "border-[#fecaca] dark:border-[#4b1b1b] bg-[#fff5f5] dark:bg-[#2d0f0f]",
				].join(" ")}
			>
				<Text
					className={
						type === "success"
							? "font-semibold text-emerald-600"
							: "font-semibold text-red-600"
					}
				>
					{type === "success" ? "✓" : "✕"}
				</Text>
				<Text
					size="2"
					weight="medium"
					className={type === "success" ? "text-emerald-700" : "text-red-700"}
				>
					{message}
				</Text>
			</div>
		</div>
	);
}
