import { Note, NoteVersion, ActivityLogWithDetails } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NoteState = {
	notes: Note[];
	noteVersions: NoteVersion[];
	selectedVersion: NoteVersion | null;
	versionLoading: boolean;
	versionError: string | null;
	activityLogs: ActivityLogWithDetails[];
	activityLogsTotal: number;
	activityLogsLimit: number;
	activityLogsOffset: number;
	activityLogsIsLoading: boolean;
	activityLogsError: string | null;
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
	fetchNoteVersions: (noteId: string) => Promise<void>;
	fetchNoteVersion: (noteId: string, versionId: string) => Promise<void>;
	restoreNoteVersion: (noteId: string, versionId: string) => Promise<void>;
	setActivityLogs: (logs: ActivityLogWithDetails[]) => void;
	fetchActivityLogs: (opts?: {
		limit?: number;
		offset?: number;
		actionType?: string;
		userId?: string;
		noteId?: string;
	}) => Promise<void>;
};

export type NoteStore = NoteState & NoteActions;

export const defaultInitState: NoteState = {
	notes: [],
	noteVersions: [],
	selectedVersion: null,
	versionLoading: false,
	versionError: null,
	activityLogs: [],
	activityLogsTotal: 0,
	activityLogsLimit: 10,
	activityLogsOffset: 0,
	activityLogsIsLoading: false,
	activityLogsError: null,
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
				fetchNoteVersions: async (noteId: string) => {
					set({ versionLoading: true, versionError: null });
					try {
						const res = await fetch(
							`/api/notes/${noteId}/versions`,
						);
						if (!res.ok) {
							const errorData = await res.json();
							throw new Error(
								errorData.error || "Failed to load versions",
							);
						}
						const { versions } = await res.json();
						set({ noteVersions: versions, versionLoading: false });
					} catch (err) {
						set({
							versionError: (err as Error).message,
							versionLoading: false,
						});
					}
				},
				fetchNoteVersion: async (noteId: string, versionId: string) => {
					set({ versionLoading: true, versionError: null });
					try {
						const res = await fetch(
							`/api/notes/${noteId}/versions/${versionId}`,
						);
						if (!res.ok) {
							const errorData = await res.json();
							throw new Error(
								errorData.error || "Failed to load version",
							);
						}
						const { version } = await res.json();
						set({
							selectedVersion: version,
							versionLoading: false,
						});
					} catch (err) {
						set({
							versionError: (err as Error).message,
							versionLoading: false,
						});
					}
				},
				restoreNoteVersion: async (
					noteId: string,
					versionId: string,
				) => {
					set({ versionLoading: true, versionError: null });
					try {
						const res = await fetch(
							`/api/notes/${noteId}/versions/${versionId}`,
							{
								method: "POST",
							},
						);
						if (!res.ok) {
							const errorData = await res.json();
							throw new Error(
								errorData.error || "Failed to restore version",
							);
						}
						const { restoredNote } = await res.json();
						set((state) => ({
							notes: state.notes.map((n) =>
								n.id === noteId ? restoredNote : n,
							),
							versionLoading: false,
						}));
					} catch (err) {
						set({
							versionError: (err as Error).message,
							versionLoading: false,
						});
					}
				},
				setActivityLogs: (logs: ActivityLogWithDetails[]) => {
					set({ activityLogs: logs });
				},
				fetchActivityLogs: async (opts = {}) => {
					set({
						activityLogsIsLoading: true,
						activityLogsError: null,
					});
					try {
						const {
							limit = 50,
							offset = 0,
							actionType,
							userId,
							noteId,
						} = opts;

						const params = new URLSearchParams({
							limit: String(limit),
							offset: String(offset),
							...(actionType && { actionType }),
							...(userId && { userId }),
							...(noteId && { noteId }),
						});

						const res = await fetch(
							`/api/activity-logs?${params.toString()}`,
						);
						if (!res.ok) {
							if (res.status === 403) {
								throw new Error(
									"You don't have permission to view activity logs.",
								);
							}
							const errorData = await res.json();
							throw new Error(
								errorData.error ||
									"Failed to fetch activity logs",
							);
						}

						const result = await res.json();
						set({
							activityLogs: result.logs,
							activityLogsTotal: result.total,
							activityLogsLimit: result.limit ?? limit,
							activityLogsOffset: result.offset ?? offset,
							activityLogsIsLoading: false,
						});
					} catch (err) {
						set({
							activityLogsError:
								(err as Error).message ||
								"Failed to fetch activity logs",
							activityLogsIsLoading: false,
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
