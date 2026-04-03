import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { getNoteVersions, createNoteVersion } from "@/server/versions";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	return withAuth(request, async (request, currentUser) => {
		try {
			const { id: noteId } = await params;

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

			const versions = await getNoteVersions(
				noteId,
				currentUser.organizationId,
			);
			return NextResponse.json({ versions });
		} catch (error) {
			console.error("Get note versions error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	});
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	return withAuth(request, async (request, currentUser) => {
		try {
			const { id: noteId } = await params;
			const { content, title, tags } = await request.json();

			if (!content || !title || !tags) {
				return NextResponse.json(
					{ error: "content, title, and tags are required" },
					{ status: 400 },
				);
			}

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

			const version = await createNoteVersion(
				noteId,
				currentUser.organizationId,
				currentUser.id,
				content,
				title,
				Array.isArray(tags) ? tags : [],
			);

			return NextResponse.json({ version });
		} catch (error) {
			console.error("Create note version error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	});
}
