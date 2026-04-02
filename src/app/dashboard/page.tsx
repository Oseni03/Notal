"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Tag, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Note } from "@/types";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";
import { authClient } from "@/lib/auth-client";

const Page = () => {
	const router = useRouter();
	const { activeOrganization, subscription } = useOrganizationStore(
		(state) => state,
	);
	const { data: session } = authClient.useSession();
	const [notes, setNotes] = useState<Note[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	const user = session?.user;

	const tenantNotes = useMemo(() => {
		return notes.filter((note) => note.tenantId === activeOrganization?.id);
	}, [notes, activeOrganization?.id]);

	const filteredNotes = useMemo(() => {
		return tenantNotes.filter(
			(note) =>
				note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
				note.tags.some((tag) =>
					tag.toLowerCase().includes(searchTerm.toLowerCase()),
				),
		);
	}, [tenantNotes, searchTerm]);

	useEffect(() => {
		const getNotes = async () => {
			try {
				const resp = await fetch("/api/notes");
				if (!resp.ok) throw new Error("Error getting notes");
				const { notes } = await resp.json();
				setNotes(notes);
			} catch (error: unknown) {
				console.log("Error getting notes", error);
				toast.info("Error getting notes");
			}
		};

		getNotes();
	}, []);

	const handleDeleteNote = async (noteId: string) => {
		try {
			toast.loading("Deleting note...");
			const response = await fetch(`/api/notes/${noteId}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				throw new Error(
					`Failed to delete note: ${response.statusText}`,
				);
			}

			const { message } = await response.json();
			setNotes((prevNotes) =>
				prevNotes.filter((note) => note.id !== noteId),
			);
			toast.dismiss();
			toast.success(message || "Note deleted successfully");
		} catch (error) {
			console.error("Error deleting note:", error);
			toast.dismiss();
			toast.error("Error deleting note");
		}
	};

	const canEditNote = (note: Note) => {
		return user?.role === "admin" || note.authorId === user?.id;
	};

	const hasReachedLimit = () => {
		return tenantNotes.length >= (subscription?.maxNotes || 50);
	};

	// Try to extract a plain-text preview from BlockNote JSON content
	const getContentPreview = (content: string): string => {
		try {
			const blocks = JSON.parse(content);
			if (!Array.isArray(blocks)) return content;
			const texts: string[] = [];
			for (const block of blocks) {
				if (Array.isArray(block.content)) {
					for (const inline of block.content) {
						if (inline.type === "text" && inline.text) {
							texts.push(inline.text);
						}
					}
				}
				if (texts.join(" ").length > 160) break;
			}
			return texts.join(" ") || "No content yet.";
		} catch {
			return content;
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Knowledge Base
					</h1>
					<p className="text-muted-foreground">
						Storage: {tenantNotes.length} of{" "}
						{(subscription?.maxNotes ?? 50) >= 10000
							? "∞"
							: (subscription?.maxNotes ?? 50)}{" "}
						notes
					</p>
				</div>
				<Button
					onClick={() => router.push("/dashboard/notes/new")}
					disabled={hasReachedLimit()}
					className="gap-2"
				>
					<Plus className="w-4 h-4" />
					New Note
				</Button>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<Input
					placeholder="Filter your insights..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Notes Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredNotes.map((note) => (
					<Card
						key={note.id}
						className="hover:shadow-md transition-shadow group cursor-pointer"
						onClick={() =>
							canEditNote(note) &&
							router.push(`/dashboard/notes/${note.id}/edit`)
						}
					>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<h3 className="font-medium text-lg line-clamp-2">
									{note.title}
								</h3>
								{canEditNote(note) && (
									<div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												router.push(
													`/dashboard/notes/${note.id}/edit`,
												);
											}}
											className="h-8 w-8 p-0"
										>
											<Edit className="w-3 h-3" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteNote(note.id);
											}}
											className="h-8 w-8 p-0 text-destructive hover:text-destructive"
										>
											<Trash2 className="w-3 h-3" />
										</Button>
									</div>
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground line-clamp-3 text-sm">
								{getContentPreview(note.content)}
							</p>

							{note.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{note.tags.slice(0, 3).map((tag) => (
										<Badge
											key={tag}
											variant="secondary"
											className="text-xs"
										>
											<Tag className="w-2 h-2 mr-1" />
											{tag}
										</Badge>
									))}
									{note.tags.length > 3 && (
										<Badge
											variant="secondary"
											className="text-xs"
										>
											+{note.tags.length - 3}
										</Badge>
									)}
								</div>
							)}

							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<div className="flex items-center gap-1">
									<User className="w-3 h-3" />
									{note.author.name}
								</div>
								<div className="flex items-center gap-1">
									<Calendar className="w-3 h-3" />
									{format(note.updatedAt, "MMM d")}
								</div>
							</div>

							{!note.isPublic && (
								<Badge variant="outline" className="text-xs">
									Private
								</Badge>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{filteredNotes.length === 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						{searchTerm
							? "No insights match your search. Try a different query."
							: "Your library is empty. Capture your first idea."}
					</p>
					{!searchTerm && (
						<Button
							onClick={() => router.push("/dashboard/notes/new")}
							disabled={hasReachedLimit()}
							className="mt-4 gap-2"
						>
							<Plus className="w-4 h-4" />
							Create your first note
						</Button>
					)}
				</div>
			)}
		</div>
	);
};

export default Page;
