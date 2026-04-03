"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import BaseEditor from "@/components/editor/base-editor";
import { Note } from "@/types";
import { useNoteStore } from "@/zustand/providers/notes-store-provider";

export default function EditNotePage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const { getNote } = useNoteStore((state) => state);
	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch the existing note
	useEffect(() => {
		const fetchNote = async () => {
			if (!params.id) return;
			try {
				const note = await getNote(params.id);
				if (note) setNote(note);
			} catch {
				toast.error("Failed to load note.");
				router.push("/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		fetchNote();
	}, [getNote, params.id, router]);

	if (isLoading) {
		return (
			<div className="flex flex-col h-full min-h-screen bg-background">
				<div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6 py-3">
					<div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
					<div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
				</div>
				<div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
					<div className="h-10 w-2/3 animate-pulse rounded-md bg-muted" />
					<div className="h-6 w-1/3 animate-pulse rounded-md bg-muted" />
					<div className="flex-1 animate-pulse rounded-xl bg-muted/30 min-h-[400px]" />
				</div>
			</div>
		);
	}

	if (!note) {
		return null;
	}

	return <BaseEditor note={note} />;
}
