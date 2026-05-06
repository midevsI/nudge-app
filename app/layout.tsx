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
									const htmlElement = document.documentElement;
									const media = window.matchMedia('(prefers-color-scheme: dark)');

									function setDarkMode(enabled) {
										if (enabled) htmlElement.classList.add('dark');
										else htmlElement.classList.remove('dark');
									}

									function parseTheme(value) {
										if (!value) return null;
										const normalized = String(value).toLowerCase();
										if (normalized === 'dark') return true;
										if (normalized === 'light') return false;
										return null;
									}

									function detectThemeFromUrl() {
										const url = new URL(window.location.href);
										const fromTheme = parseTheme(url.searchParams.get('theme'));
										if (fromTheme !== null) return fromTheme;
										return parseTheme(url.searchParams.get('appearance'));
									}

									function detectThemeFromParent() {
										if (window.parent === window) return null;
										try {
											const parentHtml = window.parent.document.documentElement;
											if (parentHtml.classList.contains('dark')) return true;
											if (parentHtml.classList.contains('light')) return false;
										} catch (_) {
											return null;
										}
										return null;
									}

									const urlTheme = detectThemeFromUrl();
									const parentTheme = detectThemeFromParent();
									const initialDark = urlTheme ?? parentTheme ?? media.matches;
									setDarkMode(initialDark);

									media.addEventListener('change', function(event) {
										const explicitTheme = detectThemeFromUrl() ?? detectThemeFromParent();
										if (explicitTheme === null) setDarkMode(event.matches);
									});

									window.addEventListener('message', function(event) {
										const data = event && event.data ? event.data : null;
										const candidate =
											parseTheme(data?.theme) ??
											parseTheme(data?.appearance) ??
											parseTheme(data?.payload?.theme) ??
											parseTheme(data?.payload?.appearance);
										if (candidate !== null) setDarkMode(candidate);
									});
								} catch (_) {
									if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
										htmlElement.classList.add('dark');
									} else {
										htmlElement.classList.remove('dark');
									}
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
