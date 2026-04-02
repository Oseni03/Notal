import { type NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/middleware";
import { getOrganizationActivityLogs } from "@/server/activity-logs";

// GET /api/activity-logs - List activity logs for organization (admin only)
export async function GET(request: NextRequest) {
	return withAdminAuth(request, async (request, currentUser) => {
		try {
			const searchParams = request.nextUrl.searchParams;
			const limit = Math.min(
				parseInt(searchParams.get("limit") || "50"),
				100,
			);
			const offset = parseInt(searchParams.get("offset") || "0");
			const actionType = searchParams.get("actionType") || undefined;
			const userId = searchParams.get("userId") || undefined;
			const noteId = searchParams.get("noteId") || undefined;

			const result = await getOrganizationActivityLogs({
				organizationId: currentUser.organizationId,
				limit,
				offset,
				actionType,
				userId,
				noteId,
			});

			return NextResponse.json(result);
		} catch (error) {
			console.error("Get activity logs error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	});
}

// Enable CORS for cross-origin requests
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
