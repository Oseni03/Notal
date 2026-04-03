"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { NoteVersion } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import BlocknoteEditor from "@/components/editor/BlocknoteEditor";
import { useNoteStore } from "@/zustand/providers/notes-store-provider";

interface VersionTimelineSidebarProps {
	noteId: string;
	onRestore: (version: NoteVersion, fullContent: string) => void;
}

export default function VersionTimelineSidebar({
	noteId,
	onRestore,
}: VersionTimelineSidebarProps) {
	const {
		noteVersions,
		selectedVersion,
		versionLoading,
		versionError,
		fetchNoteVersions,
		fetchNoteVersion,
		restoreNoteVersion,
	} = useNoteStore((state) => ({
		noteVersions: state.noteVersions,
		selectedVersion: state.selectedVersion,
		versionLoading: state.versionLoading,
		versionError: state.versionError,
		fetchNoteVersions: state.fetchNoteVersions,
		fetchNoteVersion: state.fetchNoteVersion,
		restoreNoteVersion: state.restoreNoteVersion,
	}));

	const [isModalOpen, setIsModalOpen] = useState(false);

	const selectedFullContent = selectedVersion?.fullContent || "";

	const selectedBlockContent = useMemo(() => {
		if (!selectedFullContent) return undefined;
		try {
			const parsed = JSON.parse(selectedFullContent);
			if (Array.isArray(parsed)) {
				return parsed;
			}
			return [];
		} catch {
			return [];
		}
	}, [selectedFullContent]);

	useEffect(() => {
		if (!noteId) return;
		fetchNoteVersions(noteId);
	}, [noteId, fetchNoteVersions]);

	const loadVersion = async (version: NoteVersion) => {
		await fetchNoteVersion(noteId, version.id);
		setIsModalOpen(true);
	};

	const restoreVersion = async () => {
		if (!selectedVersion) return;
		await restoreNoteVersion(noteId, selectedVersion.id);
		if (onRestore && selectedVersion.fullContent) {
			onRestore(selectedVersion, selectedVersion.fullContent);
		}
		setIsModalOpen(false);
		toast.success("Restored version and saved.");
	};

	const restoreVersion = async () => {
		if (!selectedVersion) return;
		const res = await fetch(
			`/api/notes/${noteId}/versions/${selectedVersion.id}`,
			{
				method: "POST",
			},
		);
		if (!res.ok) {
			toast.error("Failed to restore version");
			return;
		}
		toast.success("Version restored. Refreshing editor...");
		if (onRestore) {
			onRestore(selectedVersion, selectedFullContent);
		}
		// Optionally, reload to show latest note content
		window.location.reload();
	};

	return (
		<div className="w-72 min-w-[18rem] border-l border-muted/30 bg-surface px-2 py-4 overflow-y-auto">
			<Card className="h-full">
				<CardHeader>
					<CardTitle>Version History</CardTitle>
				</CardHeader>
				<CardContent>
					{versionLoading ? (
						<p className="text-sm text-muted-foreground">
							Loading versions…
						</p>
					) : noteVersions.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No versions yet.
						</p>
					) : (
						<ul className="space-y-2">
							{noteVersions.map((version) => (
								<li key={version.id}>
									<button
										className={`w-full text-left rounded-md p-2 ${
											selectedVersion?.id === version.id
												? "bg-primary/10 text-primary"
												: "bg-muted/10 text-muted-foreground"
										}`}
										onClick={() => loadVersion(version)}
									>
										<div className="text-xs font-semibold">
											v{version.versionNumber} •{" "}
											{version.type}
										</div>
										<div className="text-xs text-muted-foreground">
											{formatDistanceToNow(
												new Date(version.createdAt),
												{ addSuffix: true },
											)}
										</div>
									</button>
								</li>
							))}
						</ul>
					)}

					<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
						<DialogContent className="max-w-4xl p-2">
							<DialogHeader>
								<DialogTitle>
									Version v{selectedVersion?.versionNumber}{" "}
									Preview
								</DialogTitle>
								<DialogDescription>
									{selectedVersion?.type} (saved{" "}
									{formatDistanceToNow(
										new Date(
											selectedVersion?.createdAt ||
												Date.now(),
										),
										{ addSuffix: true },
									)}
									)
								</DialogDescription>
							</DialogHeader>
							<div className="h-[50vh] overflow-auto rounded-md border border-muted/40 p-2">
								{selectedBlockContent ? (
									<BlocknoteEditor
										initialContent={selectedBlockContent}
										onChange={() => {}}
										editable={false}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										Invalid block content
									</p>
								)}
							</div>
							<DialogFooter>
								<Button
									size="sm"
									variant="secondary"
									onClick={() => setIsModalOpen(false)}
								>
									Close
								</Button>
								<Button size="sm" onClick={restoreVersion}>
									Restore this version
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					{selectedVersion && !isModalOpen && (
						<div className="mt-4 space-y-2">
							<div className="text-xs text-muted-foreground">
								Selected: v{selectedVersion.versionNumber}
							</div>
							<Button size="sm" onClick={restoreVersion}>
								Restore this version
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
