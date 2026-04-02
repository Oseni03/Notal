"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Tag, Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";
import { Note } from "@/types";

const BlocknoteEditor = dynamic(
	() => import("@/components/editor/BlocknoteEditor"),
	{ ssr: false, loading: () => <EditorSkeleton /> },
);

function EditorSkeleton() {
	return (
		<div className="flex-1 animate-pulse rounded-xl bg-muted/30 min-h-[400px]" />
	);
}

export default function EditNotePage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const { data: session } = authClient.useSession();
	const { activeOrganization } = useOrganizationStore((state) => state);

	const [note, setNote] = useState<Note | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [initialBlocks, setInitialBlocks] = useState<Block[] | undefined>(
		undefined,
	);
	const [tagsInput, setTagsInput] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	// Fetch the existing note
	useEffect(() => {
		const fetchNote = async () => {
			if (!params.id) return;
			try {
				const res = await fetch(`/api/notes/${params.id}`);
				if (!res.ok) throw new Error("Note not found");
				const { note } = await res.json();
				setNote(note);
				setTitle(note.title);
				setTagsInput(note.tags.join(", "));
				setIsPublic(note.isPublic);

				// Try to parse existing content as BlockNote JSON
				try {
					const parsed = JSON.parse(note.content);
					if (Array.isArray(parsed)) {
						setInitialBlocks(parsed as Block[]);
						setBlocks(parsed as Block[]);
					}
				} catch {
					// Legacy plain-text content — wrap in a paragraph block
					setInitialBlocks([
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
					]);
				}
			} catch (err) {
				toast.error("Failed to load note.");
				router.push("/dashboard");
			} finally {
				setIsLoading(false);
			}
		};

		fetchNote();
	}, [params.id, router]);

	const handleEditorChange = useCallback((newBlocks: Block[]) => {
		setBlocks(newBlocks);
	}, []);

	const parsedTags = tagsInput
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const handleSave = async () => {
		if (!session?.user || !activeOrganization || !note) return;
		if (!title.trim()) {
			toast.error("Please add a title before saving.");
			return;
		}

		setIsSaving(true);
		try {
			const contentJson = JSON.stringify(blocks);

			const response = await fetch(`/api/notes/${note.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim() || "Untitled",
					content: contentJson,
					authorId: session.user.id,
					tenantId: activeOrganization.id,
					tags: parsedTags,
					isPublic,
				}),
			});

			if (!response.ok) {
				const { error } = await response.json();
				throw new Error(error || "Failed to update note");
			}

			toast.success("Note updated successfully!");
			router.push("/dashboard");
			router.refresh();
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Error saving note";
			toast.error(msg);
		} finally {
			setIsSaving(false);
		}
	};

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

	return (
		<div className="flex flex-col h-full min-h-screen bg-background">
			{/* Top bar */}
			<div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-background/90 backdrop-blur-sm px-6 py-3">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.back()}
						className="gap-2 text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="w-4 h-4" />
						Back
					</Button>
					<div className="h-4 w-px bg-border" />
					<span className="text-sm text-muted-foreground font-medium">
						Editing Note
					</span>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						{isPublic ? (
							<Globe className="w-4 h-4 text-muted-foreground" />
						) : (
							<Lock className="w-4 h-4 text-muted-foreground" />
						)}
						<Switch
							id="visibility"
							checked={isPublic}
							onCheckedChange={setIsPublic}
						/>
						<Label
							htmlFor="visibility"
							className="text-sm text-muted-foreground cursor-pointer"
						>
							{isPublic ? "Public" : "Private"}
						</Label>
					</div>

					<Button
						onClick={handleSave}
						disabled={isSaving || !title.trim()}
						size="sm"
						className="gap-2"
					>
						{isSaving ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Save className="w-4 h-4" />
						)}
						{isSaving ? "Saving…" : "Save Changes"}
					</Button>
				</div>
			</div>

			{/* Page content */}
			<div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
				{/* Title */}
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Note title…"
					className="border-0 border-b rounded-none text-3xl font-bold bg-transparent px-0 placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:border-primary"
				/>

				{/* Tags */}
				<div className="flex items-center gap-3 flex-wrap">
					<Tag className="w-4 h-4 text-muted-foreground shrink-0" />
					<Input
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						placeholder="Add tags, separated by commas…"
						className="border-0 bg-transparent px-0 text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:ring-0 max-w-sm"
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
				</div>

				{/* BlockNote Editor — only mount once initialBlocks are ready */}
				<div className="flex-1 bg-background overflow-hidden">
					<div className="p-0">
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
