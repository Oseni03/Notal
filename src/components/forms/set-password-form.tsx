"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Lock } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const formSchema = z
	.object({
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

interface SetPasswordFormProps {
	onSuccess?: () => void;
}

export function SetPasswordForm({ onSuccess }: SetPasswordFormProps) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true);
			const { data, error } = await authClient.resetPassword({
				newPassword: values.password,
			});
			if (data?.status) {
				toast.success("Password set successfully.");
				onSuccess?.();
			} else {
				toast.error(error?.message);
			}
		} catch (error) {
			toast.error("Failed to set password");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="Enter new password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="Confirm new password"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isLoading} className="w-full">
					<Lock className="w-4 h-4 mr-2" />
					{isLoading ? "Setting Password..." : "Set Password"}
				</Button>
			</form>
		</Form>
	);
}
