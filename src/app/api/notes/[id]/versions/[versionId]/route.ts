import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getNoteVersion } from "@/server/versions";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; versionId: string }> },
) {
	return withAuth(request, async (request, currentUser) => {
		try {
			const { id: noteId, versionId } = await params;

			const note = await prisma.note.findFirst({
				where: {
					id: noteId,
					tenantId: currentUser.organizationId,
				},
			});

			if (!note) {
				return NextResponse.json(
					{ error: "Note not found" },
					{ status: 404 },
				);
			}

			if (
				note.authorId !== currentUser.id &&
				currentUser.role !== "admin"
			) {
				return NextResponse.json(
					{ error: "Access denied" },
					{ status: 403 },
				);
			}

			const version = await getNoteVersion(
				noteId,
				versionId,
				currentUser.organizationId,
			);
			if (!version) {
				return NextResponse.json(
					{ error: "Version not found" },
					{ status: 404 },
				);
			}

			return NextResponse.json({ version });
		} catch (error) {
			console.error("Get note version error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	});
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; versionId: string }> },
) {
	// restore this note to the version
	return withAuth(request, async (request, currentUser) => {
		try {
			const { id: noteId, versionId } = await params;

			const version = await getNoteVersion(
				noteId,
				versionId,
				currentUser.organizationId,
			);
			if (!version) {
				return NextResponse.json(
					{ error: "Version not found" },
					{ status: 404 },
				);
			}

			const existingNote = await prisma.note.findFirst({
				where: {
					id: noteId,
					tenantId: currentUser.organizationId,
				},
			});

			if (!existingNote) {
				return NextResponse.json(
					{ error: "Note not found" },
					{ status: 404 },
				);
			}

			if (
				existingNote.authorId !== currentUser.id &&
				currentUser.role !== "admin"
			) {
				return NextResponse.json(
					{ error: "Access denied" },
					{ status: 403 },
				);
			}

			const restoredNote = await prisma.note.update({
				where: { id: noteId },
				data: {
					title: version.title,
					content: version.fullContent,
					tags: version.tags,
				},
			});

			await prisma.noteVersion.create({
				data: {
					noteId,
					organizationId: currentUser.organizationId,
					authorId: currentUser.id,
					versionNumber:
						(await prisma.noteVersion.count({
							where: { noteId },
						})) + 1,
					type: "snapshot",
					content: version.fullContent,
					title: version.title,
					tags: version.tags,
				},
			});

			return NextResponse.json({ restoredNote });
		} catch (error) {
			console.error("Restore note version error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	});
}
