"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

export default function NewNotePage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { activeOrganization } = useOrganizationStore((state) => state);

	const [title, setTitle] = useState("");
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [tagsInput, setTagsInput] = useState("");
	const [isPublic, setIsPublic] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const handleEditorChange = useCallback((newBlocks: Block[]) => {
		setBlocks(newBlocks);
	}, []);

	const parsedTags = tagsInput
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const handleSave = async () => {
		if (!session?.user || !activeOrganization) {
			toast.error("You must be logged in to save notes.");
			return;
		}
		if (!title.trim()) {
			toast.error("Please add a title before saving.");
			return;
		}

		setIsSaving(true);
		try {
			// Serialize BlockNote document to JSON string for storage
			const contentJson = JSON.stringify(blocks);

			const response = await fetch("/api/notes", {
				method: "POST",
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
				throw new Error(error || "Failed to create note");
			}

			await response.json();
			toast.success("Note saved successfully!");
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
						New Note
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
						disabled={isSaving || !title.trim()}
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

				{/* BlockNote Editor */}
				<div className="flex-1 bg-background overflow-hidden">
					<div className="p-0">
						<BlocknoteEditor onChange={handleEditorChange} />
					</div>
				</div>
			</div>
		</div>
	);
}
