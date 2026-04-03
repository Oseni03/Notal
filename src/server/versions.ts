import { prisma } from "@/lib/prisma";
import { createPatch, applyPatch } from "diff";

const SNAPSHOT_INTERVAL = 10;
const MAX_VERSIONS_PER_NOTE = 50;

export async function getNoteVersions(noteId: string, organizationId: string) {
	return prisma.noteVersion.findMany({
		where: { noteId, organizationId },
		orderBy: { versionNumber: "desc" },
		take: MAX_VERSIONS_PER_NOTE,
	});
}

export async function getNoteVersion(
	noteId: string,
	versionId: string,
	organizationId: string,
) {
	const version = await prisma.noteVersion.findFirst({
		where: { id: versionId, noteId, organizationId },
	});
	if (!version) return null;
	const fullContent = await reconstructNoteVersionContent(
		noteId,
		version.versionNumber,
	);
	return { ...version, fullContent };
}

export async function reconstructNoteVersionContent(
	noteId: string,
	targetVersionNumber: number,
) {
	const versions = await prisma.noteVersion.findMany({
		where: { noteId, versionNumber: { lte: targetVersionNumber } },
		orderBy: { versionNumber: "asc" },
	});
	if (versions.length === 0) {
		return "";
	}

	let idxOfSnapshot = -1;
	for (let i = versions.length - 1; i >= 0; i--) {
		if (versions[i].type === "snapshot") {
			idxOfSnapshot = i;
			break;
		}
	}

	if (idxOfSnapshot === -1) {
		// no snapshot found; start from initial content (first record should be snapshot, else diff chain from initial content)
		idxOfSnapshot = 0;
	}

	let content = versions[idxOfSnapshot].content;
	for (let i = idxOfSnapshot + 1; i < versions.length; i++) {
		if (versions[i].type === "diff") {
			const result = applyPatch(content, versions[i].content);
			if (result === false) {
				throw new Error(
					"Failed to apply patch when reconstructing version content",
				);
			}
			content = result;
		} else {
			content = versions[i].content;
		}
	}

	return content;
}

export async function createNoteVersion(
	noteId: string,
	organizationId: string,
	authorId: string,
	content: string,
	title: string,
	tags: string[],
) {
	const latestVersion = await prisma.noteVersion.findFirst({
		where: { noteId, organizationId },
		orderBy: { versionNumber: "desc" },
	});

	const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
	const isSnapshot =
		versionNumber === 1 || versionNumber % SNAPSHOT_INTERVAL === 0;

	let latestFullContent = "";
	if (latestVersion) {
		latestFullContent = await reconstructNoteVersionContent(
			noteId,
			latestVersion.versionNumber,
		);
	}

	if (
		latestVersion &&
		latestFullContent === content &&
		latestVersion.title === title &&
		JSON.stringify(latestVersion.tags) === JSON.stringify(tags)
	) {
		return latestVersion; // no change, avoid duplicate version
	}

	let diffBaseId: string | null = null;
	let storedContent = content;
	let type: "snapshot" | "diff" = "snapshot";

	if (!isSnapshot && latestVersion) {
		type = "diff";
		diffBaseId = latestVersion.id;
		storedContent = createPatch("note", latestFullContent, content);
	}

	const version = await prisma.noteVersion.create({
		data: {
			noteId,
			organizationId,
			authorId,
			versionNumber,
			type,
			content: storedContent,
			title,
			tags,
			diffBaseId,
		},
	});

	await pruneNoteVersions(noteId, organizationId);
	return version;
}

export async function pruneNoteVersions(
	noteId: string,
	organizationId: string,
) {
	const versions = await prisma.noteVersion.findMany({
		where: { noteId, organizationId },
		orderBy: { versionNumber: "desc" },
		take: MAX_VERSIONS_PER_NOTE,
		select: { id: true },
	});

	if (versions.length < MAX_VERSIONS_PER_NOTE) {
		return;
	}

	const oldestKeptVersionNumber = await prisma.noteVersion.findFirst({
		where: { noteId, organizationId },
		orderBy: { versionNumber: "desc" },
		offset: MAX_VERSIONS_PER_NOTE - 1,
		select: { versionNumber: true },
	});

	if (!oldestKeptVersionNumber) {
		return;
	}

	await prisma.noteVersion.deleteMany({
		where: {
			noteId,
			organizationId,
			versionNumber: { lt: oldestKeptVersionNumber.versionNumber },
		},
	});
}
