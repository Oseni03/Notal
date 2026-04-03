"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users } from "lucide-react";
import { Progress } from "../ui/progress";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";
import { useNoteStore } from "@/zustand/providers/notes-store-provider";

export const UsageCard = () => {
	const { subscription, members } = useOrganizationStore((state) => state);
	const notes = useNoteStore((state) => state.notes);

	const maxNotes = subscription?.maxNotes
		? subscription?.maxNotes == 1
			? 1000000000
			: subscription?.maxNotes
		: 50;

	const maxUsers = subscription?.maxUsers
		? subscription?.maxUsers == 1
			? 1000000000
			: subscription?.maxUsers
		: 50;

	const membersCount = members.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="w-5 h-5" />
					Usage & Limits
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Users</span>
						<span className="font-medium">
							{membersCount} / {maxUsers}
						</span>
					</div>
					<Progress
						value={((membersCount || 0) / maxUsers) * 100}
						className="h-2"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Notes</span>
						<span className="font-medium">
							{notes.length} / {maxNotes}
						</span>
					</div>
					<Progress
						value={(notes.length / maxNotes) * 100}
						className="h-2"
					/>
				</div>
			</CardContent>
		</Card>
	);
};
