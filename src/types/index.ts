import { Subscription } from "@prisma/client";

export interface User {
	role?: string;
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null | undefined;
}

export interface MemberUser {
	email: string;
	name: string;
	image?: string;
}

export interface Member {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: Date;
	user: MemberUser;
}
export interface Organization {
	id: string;
	name: string;
	slug: string;
	subscription?: Subscription;
	createdAt: Date;
	logo?: string | null;
	// metadata?: any;
}

export interface Note {
	id: string;
	title: string;
	content: string;
	authorId: string;
	tenantId: string;
	tags: string[];
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
	author: User;
	lastActivity?: {
		id: string;
		user: {
			id: string;
			name: string;
			email: string;
		};
		actionType: string;
		createdAt: Date;
	};
}

export interface NoteVersion {
	id: string;
	noteId: string;
	organizationId: string;
	authorId: string;
	versionNumber: number;
	type: "snapshot" | "diff";
	content: string;
	fullContent?: string;
	title: string;
	tags: string[];
	diffBaseId?: string;
	createdAt: Date;
}

export interface InvitationData {
	id: string;
	email: string;
	role: string;
	organizationId: string;
	teamId?: string;
	status: "pending" | "accepted" | "rejected" | "cancelled";
	createdAt: string;
	expiresAt: string;
}

export interface ActivityLogWithDetails {
	id: string;
	userId: string;
	noteId: string;
	actionType: string;
	ipAddress?: string;
	createdAt: Date;
	user: {
		id: string;
		name: string;
		email: string;
	};
	note: {
		id: string;
		title: string;
	};
}
