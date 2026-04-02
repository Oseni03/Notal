"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useNoteStore } from "@/zustand/providers/notes-store-provider";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";
import { Note } from "@/types";

// Dynamically import BlockNote to avoid SSR issues
const BlocknoteEditor = dynamic(
	() => import("@/components/editor/BlocknoteEditor"),
	{ ssr: false, loading: () => <EditorSkeleton /> },
);

function EditorSkeleton() {
	return (
		<div className="flex-1 animate-pulse rounded-xl bg-muted/30 min-h-[400px]" />
	);
}

export default function BaseEditor({
	title: initialTitle = "",
	note,
}: {
	title?: string;
	note?: Note;
}) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { activeOrganization } = useOrganizationStore((state) => state);
	const { addNote, updateNote } = useNoteStore((state) => state);

	const [noteTitle, setNoteTitle] = useState(initialTitle);
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [initialBlocks, setInitialBlocks] = useState<Block[] | undefined>(
		undefined,
	);
	const [tagsInput, setTagsInput] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	// Initialize state if editing an existing note
	useEffect(() => {
		if (note) {
			setNoteTitle(note.title);
			setTagsInput(note.tags.join(", "));
			setIsPublic(note.isPublic);

			// Try to parse existing content as BlockNote JSON
			try {
				const parsed = JSON.parse(note.content);
				if (Array.isArray(parsed)) {
					setInitialBlocks(parsed as Block[]);
					setBlocks(parsed as Block[]);
				} else {
					throw new Error("Not an array");
				}
			} catch {
				// Legacy plain-text content — wrap in a paragraph block
				const legacyBlocks = [
					{
						id: "legacy-0",
						type: "paragraph",
						props: {
							textColor: "default",
							backgroundColor: "default",
							textAlignment: "left",
						},
						content: [
							{
								type: "text",
								text: note.content,
								styles: {},
							},
						],
						children: [],
					} as unknown as Block,
				];
				setInitialBlocks(legacyBlocks);
				setBlocks(legacyBlocks);
			}
		} else {
			// For new notes, no initial blocks
			setInitialBlocks([]);
		}
	}, [note]);

	const handleEditorChange = useCallback((newBlocks: Block[]) => {
		setBlocks(newBlocks);
	}, []);

	const parsedTags = tagsInput
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const lastActivity = note?.lastActivity;
	const lastActivityText = lastActivity
		? `Last ${lastActivity.actionType.toLowerCase()} by ${
				lastActivity.user.name || lastActivity.user.email
			} ${formatDistanceToNow(new Date(lastActivity.createdAt), {
				addSuffix: true,
			})}`
		: "";

	const handleSave = useCallback(async () => {
		if (!session?.user || !activeOrganization) {
			toast.error("You must be logged in to save notes.");
			return;
		}
		if (!noteTitle.trim()) {
			toast.error("Please add a title before saving.");
			return;
		}

		setIsSaving(true);
		try {
			// Serialize BlockNote document to JSON string for storage
			const contentJson = JSON.stringify(blocks);

			const isEditing = !!note;

			if (isEditing && note) {
				await updateNote(note.id, {
					title: noteTitle.trim(),
					content: contentJson,
					tags: parsedTags,
					isPublic,
				});
				toast.success("Note updated successfully!");
			} else {
				await addNote({
					title: noteTitle.trim(),
					content: contentJson,
					authorId: session.user.id,
					tenantId: activeOrganization.id,
					tags: parsedTags,
					isPublic,
				});
				toast.success("Note saved successfully!");
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: `Error ${note ? "updating" : "saving"} note`;
			toast.error(msg);
		} finally {
			setIsSaving(false);
		}
	}, [
		addNote,
		activeOrganization,
		note,
		noteTitle,
		isPublic,
		parsedTags,
		session,
		setIsSaving,
		updateNote,
		blocks,
	]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				event.key.toLowerCase() === "s"
			) {
				event.preventDefault();
				handleSave();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleSave]);

	return (
		<div className="flex flex-col h-full min-h-screen bg-background">
			{/* Top bar */}
			<div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-background/75 backdrop-blur-sm px-6 py-2 border-b border-muted/20">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.back()}
						className="gap-2 text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="w-4 h-4" />
						Back
					</Button>
					<span className="text-sm text-muted-foreground/80">
						{note ? "Edit Note" : "New Note"}
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground/85">
					<Switch
						id="visibility"
						checked={isPublic}
						onCheckedChange={setIsPublic}
						className="scale-90"
					/>
					<Label
						htmlFor="visibility"
						className="text-muted-foreground/80"
					>
						{isPublic ? "Public" : "Private"}
					</Label>

					<Button
						onClick={handleSave}
						disabled={isSaving || !noteTitle.trim()}
						size="sm"
						variant="outline"
						className="gap-2 text-sm"
					>
						{isSaving ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Save className="w-4 h-4" />
						)}
						{isSaving ? "Saving…" : "Save"}
					</Button>
				</div>
			</div>

			<div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
				<Input
					value={noteTitle}
					onChange={(e) => setNoteTitle(e.target.value)}
					placeholder="Note title"
					className="border-0 text-xl md:text-4xl text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0"
				/>

				<Input
					value={tagsInput}
					onChange={(e) => setTagsInput(e.target.value)}
					placeholder="Add tags, separated by commas…"
					className="border-0 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 max-w-sm"
				/>
				{parsedTags.length > 0 && (
					<div className="flex gap-1 flex-wrap">
						{parsedTags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className="text-xs"
							>
								{tag}
							</Badge>
						))}
					</div>
				)}

				{lastActivity && (
					<div className="flex items-center gap-2">
						<Badge className="text-xs" variant="outline">
							{lastActivityText}
						</Badge>
					</div>
				)}

				{/* BlockNote Editor */}
				<div className="flex-1 bg-background overflow-hidden">
					<div className="p-0 pt-5">
						{initialBlocks !== undefined ? (
							<BlocknoteEditor
								key={note?.id}
								initialContent={initialBlocks}
								onChange={handleEditorChange}
							/>
						) : (
							<EditorSkeleton />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
