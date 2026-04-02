import { prisma } from "@/lib/prisma";

export type ActivityActionType = "Created" | "Edited" | "Deleted" | "Restored";

export async function createActivityLog(opts: {
	noteId: string;
	organizationId: string;
	userId: string;
	actionType: ActivityActionType;
	ipAddress?: string | null;
}) {
	const { noteId, organizationId, userId, actionType, ipAddress } = opts;

	return prisma.activityLog.create({
		data: {
			noteId,
			organizationId,
			userId,
			actionType,
			ipAddress,
		},
	});
}

export async function getLastActivityForNote(noteId: string) {
	return prisma.activityLog.findFirst({
		where: { noteId },
		orderBy: { createdAt: "desc" },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
}

export async function getOrganizationActivityLogs(opts: {
	organizationId: string;
	limit?: number;
	offset?: number;
	actionType?: string;
	userId?: string;
	noteId?: string;
}) {
	const {
		organizationId,
		limit = 50,
		offset = 0,
		actionType,
		userId,
		noteId,
	} = opts;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const where: any = { organizationId };

	if (actionType) where.actionType = actionType;
	if (userId) where.userId = userId;
	if (noteId) where.noteId = noteId;

	const [logs, total] = await Promise.all([
		prisma.activityLog.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: limit,
			skip: offset,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				note: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		}),
		prisma.activityLog.count({ where }),
	]);

	return {
		logs,
		total,
		limit,
		offset,
	};
}
