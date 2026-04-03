import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { OrganizationStoreProvider } from "@/zustand/providers/organization-store-provider";
import { NoteStoreProvider } from "@/zustand/providers/notes-store-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Notall",
    description:
        "The enterprise-ready multi-tenant note-taking platform with soft deletes, activity logs, and version history.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>
                    <OrganizationStoreProvider>
                        <NoteStoreProvider>{children}</NoteStoreProvider>
                    </OrganizationStoreProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
