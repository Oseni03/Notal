import { Note } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NoteState = {
	notes: Note[];
	isLoading: boolean;
	error: string | null;
};

type NoteActions = {
	setNotes: () => Promise<void>;
	getNote: (noteId: string) => Note | undefined;
	addNote: (noteData: {
		title: string;
		content: string;
		authorId: string;
		tenantId: string;
		tags?: string[];
		isPublic?: boolean;
	}) => Promise<void>;
	updateNote: (
		noteId: string,
		updates: {
			title?: string;
			content?: string;
			tags?: string[];
			isPublic?: boolean;
		},
	) => Promise<void>;
	deleteNote: (noteId: string) => Promise<void>;
};

export type NoteStore = NoteState & NoteActions;

export const defaultInitState: NoteState = {
	notes: [],
	isLoading: false,
	error: null,
};

export const createNoteStore = (initState: NoteState = defaultInitState) => {
	return create<NoteStore>()(
		persist(
			(set, get) => ({
				...initState,
				setNotes: async () => {
					set({ isLoading: true, error: null });
					try {
						const res = await fetch("/api/notes");
						if (!res.ok) throw new Error("Failed to fetch notes");
						const { notes } = await res.json();
						set({ notes, isLoading: false });
					} catch (err) {
						set({
							error: (err as Error).message,
							isLoading: false,
						});
					}
				},
				getNote: (noteId: string) => {
					return get().notes.find((note) => note.id === noteId);
				},
				addNote: async (noteData) => {
					set({ isLoading: true, error: null });
					try {
						const res = await fetch("/api/notes", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(noteData),
						});
						if (!res.ok) {
							const errorData = await res.json();
							throw new Error(
								errorData.error || "Failed to create note",
							);
						}
						const { note } = await res.json();
						set((state) => ({
							notes: [note, ...state.notes],
							isLoading: false,
						}));
					} catch (err) {
						set({
							error: (err as Error).message,
							isLoading: false,
						});
					}
				},
				updateNote: async (
					noteId: string,
					updates: {
						title?: string;
						content?: string;
						tags?: string[];
						isPublic?: boolean;
					},
				) => {
					set({ isLoading: true, error: null });
					try {
						const existingNote = get().notes.find(
							(n) => n.id === noteId,
						);
						if (!existingNote) throw new Error("Note not found");

						const updateData = {
							...updates,
							authorId: existingNote.authorId,
							tenantId: existingNote.tenantId,
						};

						const res = await fetch(`/api/notes/${noteId}`, {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(updateData),
						});
						if (!res.ok) {
							const errorData = await res.json();
							throw new Error(
								errorData.error || "Failed to update note",
							);
						}
						const { note } = await res.json();
						set((state) => ({
							notes: state.notes.map((n) =>
								n.id === noteId ? note : n,
							),
							isLoading: false,
						}));
					} catch (err) {
						set({
							error: (err as Error).message,
							isLoading: false,
						});
					}
				},
				deleteNote: async (noteId: string) => {
					set({ isLoading: true, error: null });
					try {
						const res = await fetch(`/api/notes/${noteId}`, {
							method: "DELETE",
						});
						if (!res.ok) {
							const errorData = await res.json();
							throw new Error(
								errorData.error || "Failed to delete note",
							);
						}
						set((state) => ({
							notes: state.notes.filter((n) => n.id !== noteId),
							isLoading: false,
						}));
					} catch (err) {
						set({
							error: (err as Error).message,
							isLoading: false,
						});
					}
				},
			}),
			{
				name: "notes-store",
			},
		),
	);
};
