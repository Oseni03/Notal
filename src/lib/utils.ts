import { clsx, type ClassValue } from "clsx";
import { Building2, Zap } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const SUBSCRIPTION_PLANS = [
	{
		id: "free",
		name: "Free",
		description: "Everything you need to start organizing your team's knowledge.",
		price: "$0",
		period: "/month",
		maxUsers: 3,
		maxNotes: 50,
		icon: Building2,
		features: [
			"Up to 3 team members",
			"50 notes per workspace",
			"Full-text search",
			"Tag-based organization",
		],
		popular: false,
		productId: process.env.NEXT_PUBLIC_FREE_PLAN_ID || "",
	},
	{
		id: "pro",
		name: "Pro",
		description: "Enterprise-grade governance for teams that demand precision and control.",
		price: "$19",
		period: "/month",
		maxUsers: 10000,
		maxNotes: 10000,
		icon: Zap,
		features: [
			"Unlimited team members",
			"Unlimited notes & workspaces",
			"Advanced Data Recovery (Trash)",
			"Enterprise Audit Trails",
			"Full Document Versioning",
			"Priority support",
		],
		popular: true,
		productId: process.env.NEXT_PUBLIC_PRO_PLAN_ID || "",
	},
];

export const FREE_PLAN = SUBSCRIPTION_PLANS.at(0);

export const getPlan = (planId: string) => {
	return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
};

export const getPlanByProductId = (productId: string) => {
	return (
		SUBSCRIPTION_PLANS.find((plan) => plan.productId === productId) ||
		FREE_PLAN
	);
};
