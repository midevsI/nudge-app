import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Whop App",
	description: "My Whop App",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									// Detect parent iframe theme or system preference
									const htmlElement = document.documentElement;
									
									// Check if we can access parent frame's theme
									if (window.parent !== window) {
										try {
											const parentHtml = window.parent.document.documentElement;
											const parentHasDark = parentHtml.classList.contains('dark') || 
														  window.parent.matchMedia('(prefers-color-scheme: dark)').matches;
											if (parentHasDark) {
												htmlElement.classList.add('dark');
											}
										} catch (e) {
											// Can't access parent, fall back to system preference
										}
									} else {
										// Not in iframe, use system preference
										if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
											htmlElement.classList.add('dark');
										}
									}
									
									// Listen for system preference changes
									window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
										if (e.matches) {
											htmlElement.classList.add('dark');
										} else {
											htmlElement.classList.remove('dark');
										}
									});
								} catch (e) {
									console.error('Theme detection error:', e);
								}
							})();
						`,
					}}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<WhopApp accentColor="orange" appearance="light">
					{children}
				</WhopApp>
			</body>
		</html>
	);
}
