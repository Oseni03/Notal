"use client";

import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, AlertCircle, Activity } from "lucide-react";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";
import { useNoteStore } from "@/zustand/providers/notes-store-provider";
import { formatDistanceToNow } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
	Created: "bg-green-100 text-green-800",
	Edited: "bg-blue-100 text-blue-800",
	Deleted: "bg-red-100 text-red-800",
	Restored: "bg-purple-100 text-purple-800",
};

export default function ActivityLogsPage() {
	const { isAdmin } = useOrganizationStore((state) => state);
	const logs = useNoteStore((state) => state.activityLogs);
	const total = useNoteStore((state) => state.activityLogsTotal);
	const error = useNoteStore((state) => state.activityLogsError);
	const isLoading = useNoteStore((state) => state.activityLogsIsLoading);
	const fetchLogs = useNoteStore((state) => state.fetchActivityLogs);

	// Filter states
	const [actionFilter, setActionFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(0);
	const limit = 10;
	const offset = currentPage * limit;

	useEffect(() => {
		if (isAdmin) {
			fetchLogs({
				actionType: actionFilter === "all" ? "" : actionFilter,
				limit,
				offset,
			});
		}
	}, [isAdmin, fetchLogs, actionFilter, offset, limit]);

	const totalPages = Math.ceil(total / limit);

	if (!isAdmin) {
		return (
			<div className="p-6 space-y-6">
				<h1 className="text-2xl font-bold">Activity Logs</h1>
				<p className="text-muted-foreground">
					Audit trail of note actions (create/edit/delete). Only
					admins can view this data.
				</p>
				<Card className="border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-900">
							<AlertCircle className="w-5 h-5" />
							Access Denied
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-red-800">
							Only administrators can view activity logs.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">Activity Logs</h1>
			<p className="text-muted-foreground">
				Audit trail of note actions (create/edit/delete). Only admins
				can view this data.
			</p>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Activity className="w-5 h-5" />
								Activity Logs
							</CardTitle>
							<CardDescription>
								View all note creation, editing, and deletion
								activities
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Filters */}
					<div className="flex gap-4 flex-wrap">
						<div className="w-full sm:w-48">
							<Select
								value={actionFilter}
								onValueChange={setActionFilter}
							>
								<SelectTrigger>
									<SelectValue placeholder="Filter by action..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All Actions
									</SelectItem>
									<SelectItem value="Created">
										Created
									</SelectItem>
									<SelectItem value="Edited">
										Edited
									</SelectItem>
									<SelectItem value="Deleted">
										Deleted
									</SelectItem>
									<SelectItem value="Restored">
										Restored
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button
							onClick={() => {
								setCurrentPage(0);
								setActionFilter("all");
								fetchLogs({ limit, offset: 0 });
							}}
							variant="outline"
							size="sm"
						>
							Reset Filters
						</Button>
					</div>

					{/* Error state */}
					{error && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{error}
						</div>
					)}

					{/* Loading state */}
					{isLoading && (
						<div className="text-center py-8 text-muted-foreground">
							Loading activity logs...
						</div>
					)}

					{/* Empty state */}
					{!isLoading && logs.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							No activity logs found.
						</div>
					)}

					{/* Activity Logs Table */}
					{!isLoading && logs.length > 0 && (
						<>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Action</TableHead>
											<TableHead>Note</TableHead>
											<TableHead>User</TableHead>
											<TableHead>IP Address</TableHead>
											<TableHead>Timestamp</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{logs.map((log) => (
											<TableRow key={log.id}>
												<TableCell>
													<Badge
														className={
															ACTION_COLORS[
																log.actionType
															] ||
															"bg-gray-100 text-gray-800"
														}
														variant="outline"
													>
														{log.actionType}
													</Badge>
												</TableCell>
												<TableCell className="max-w-xs truncate">
													<a
														href={`/dashboard/notes/${log.noteId}/edit`}
														className="text-blue-600 hover:underline text-sm"
														title={log.note.title}
													>
														{log.note.title}
													</a>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														<div className="font-medium">
															{log.user.name}
														</div>
														<div className="text-xs text-muted-foreground">
															{log.user.email}
														</div>
													</div>
												</TableCell>
												<TableCell className="text-xs font-mono text-muted-foreground">
													{log.ipAddress || "—"}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{formatDistanceToNow(
														new Date(log.createdAt),
														{
															addSuffix: true,
														},
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							<div className="flex items-center justify-between pt-4 border-t">
								<div className="text-xs sm:text-sm text-muted-foreground">
									Showing {offset + 1} to{" "}
									{Math.min(offset + limit, total)} of {total}{" "}
									entries
								</div>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											setCurrentPage(
												Math.max(0, currentPage - 1),
											)
										}
										disabled={
											currentPage === 0 || isLoading
										}
									>
										<ChevronLeft className="w-4 h-4" />
										Previous
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											setCurrentPage(
												Math.min(
													totalPages - 1,
													currentPage + 1,
												),
											)
										}
										disabled={
											currentPage >= totalPages - 1 ||
											isLoading
										}
									>
										Next
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
