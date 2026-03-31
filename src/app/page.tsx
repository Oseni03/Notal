"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
	FileText,
	Users,
	Shield,
	Zap,
	CheckCircle,
	ArrowRight,
	Sparkles,
	Layers,
	RefreshCw,
	History,
	Trash2,
	Github,
	Twitter,
	Linkedin,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// --- Mockup Components for "Sophisticated" UI feel ---

const AppMockup = ({ className = "" }: { className?: string }) => (
	<div className={`relative rounded-xl border bg-card shadow-2xl overflow-hidden ${className}`}>
		<div className="flex items-center gap-1.5 border-b px-4 py-2 bg-muted/50">
			<div className="w-2.5 h-2.5 rounded-full bg-destructive/20" />
			<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
			<div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
		</div>
		<div className="p-4 flex gap-4">
			<div className="w-1/4 space-y-2">
				<div className="h-4 w-full bg-muted rounded animate-pulse" />
				<div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
				<div className="h-4 w-full bg-muted rounded animate-pulse" />
			</div>
			<div className="flex-1 space-y-4">
				<div className="h-8 w-1/2 bg-muted/80 rounded" />
				<div className="space-y-2">
					<div className="h-4 w-full bg-muted/50 rounded" />
					<div className="h-4 w-full bg-muted/50 rounded" />
					<div className="h-4 w-2/3 bg-muted/50 rounded" />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="h-24 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center">
						<Sparkles className="w-6 h-6 text-primary/40" />
					</div>
					<div className="h-24 bg-accent/5 rounded-lg border border-border flex items-center justify-center">
						<Layers className="w-6 h-6 text-muted-foreground/40" />
					</div>
				</div>
			</div>
		</div>
	</div>
);

const IntegrationCloud = () => (
	<div className="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center">
		<div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
		<div className="relative z-10 w-24 h-24 rounded-2xl bg-primary shadow-xl flex items-center justify-center">
			<FileText className="w-10 h-10 text-primary-foreground" />
		</div>
		{[0, 60, 120, 180, 240, 300].map((deg, i) => (
			<div
				key={i}
				className="absolute w-12 h-12 rounded-xl bg-card border shadow-md flex items-center justify-center transition-transform hover:scale-110"
				style={{
					transform: `rotate(${deg}deg) translateX(120px) rotate(-${deg}deg)`,
				}}
			>
				{i % 3 === 0 ? <Zap className="w-5 h-5 text-primary" /> : <Layers className="w-5 h-5 text-muted-foreground" />}
			</div>
		))}
		<svg className="absolute inset-0 pointer-events-none opacity-20" viewBox="0 0 400 400">
			{[0, 60, 120, 180, 240, 300].map((deg, i) => (
				<path
					key={i}
					d={`M 200 200 Q ${200 + Math.cos((deg * Math.PI) / 180) * 80} ${200 + Math.sin((deg * Math.PI) / 180) * 80} ${
						200 + Math.cos((deg * Math.PI) / 180) * 120
					} ${200 + Math.sin((deg * Math.PI) / 180) * 120}`}
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeDasharray="4 4"
				/>
			))}
		</svg>
	</div>
);

const Page = () => {
	const { user } = authClient.useSession().data || {};
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			toast.loading("Signing out");
			authClient.signOut();
			toast.dismiss();
			toast.success("Signed out");
			router.push("/");
		} catch (error) {
			console.log("Error signing out: ", error);
			toast.dismiss();
			toast.error("Error signing out");
		}
	};

	return (
		<div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary font-sans">
			{/* Navbar */}
			<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
				<div className="container mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center gap-8">
						<Link href="/" className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
								<FileText className="w-4 h-4 text-primary-foreground" />
							</div>
							<span className="text-xl font-bold tracking-tight">Notal</span>
						</Link>
						<nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
							<Link href="#features" className="hover:text-primary transition-colors">Features</Link>
							<Link href="#workflow" className="hover:text-primary transition-colors">Workflow</Link>
							<Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
						</nav>
					</div>
					<div className="flex items-center gap-4">
						{user ? (
							<>
								<Button onClick={handleSignOut} variant="ghost" size="sm">Sign Out</Button>
								<Link href="/dashboard">
									<Button size="sm">Dashboard</Button>
								</Link>
							</>
						) : (
							<>
								<Link href="/login">
									<Button variant="ghost" size="sm">Sign In</Button>
								</Link>
								<Link href="/signup">
									<Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative pt-24 pb-20 overflow-hidden">
				{/* Layered mesh background */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/8 rounded-full blur-[140px]" />
					<div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
					<div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
				</div>
				<div className="container relative mx-auto px-4 text-center">
					<Badge variant="outline" className="mb-6 rounded-full border-primary/20 bg-primary/5 text-primary px-4 py-1 animate-in fade-in slide-in-from-bottom-3">
						<Sparkles className="w-3 h-3 mr-2" />
						The next generation of team knowledge
					</Badge>
					<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
						Thought translated
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/50">
							into insights.
						</span>
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
						The definitive workspace for modern organizations that value
						<span className="text-foreground font-medium"> speed, governance,</span> and
						<span className="text-foreground font-medium"> elegance.</span>
					</p>
					<p className="text-sm text-muted-foreground/60 mb-10">
						Secure multi-tenant notes &mdash; built for teams that can&apos;t afford to lose context.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
						<Link href="/signup">
							<Button size="lg" className="rounded-full px-8 h-14 text-base shadow-xl shadow-primary/20 gap-2">
								Start for free <ArrowRight className="w-4 h-4" />
							</Button>
						</Link>
						<Link href="#features">
							<Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base">
								Explore features
							</Button>
						</Link>
					</div>

					<div className="relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
						<div className="absolute -inset-4 bg-primary/15 blur-[80px] -z-10 rounded-full" />
						{/* Floating trust indicator */}
						<div className="flex justify-center mb-4">
							<div className="inline-flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-4 py-1.5 bg-background/80 backdrop-blur-sm shadow-sm">
								<div className="flex -space-x-1">
									{[0, 1, 2].map(i => (
										<div key={i} className="w-5 h-5 rounded-full bg-muted border-2 border-background" />
									))}
								</div>
								Trusted by innovative teams worldwide
							</div>
						</div>
						<AppMockup className="mx-auto" />
						<div className="absolute -right-8 -bottom-8 hidden lg:block w-72">
							<Card className="shadow-2xl border-primary/10 backdrop-blur-xl bg-background/80">
								<CardContent className="p-4 space-y-3">
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center">
											<RefreshCw className="w-4 h-4 text-green-600" />
										</div>
										<div>
											<p className="text-sm font-medium">Real-time sync active</p>
											<p className="text-xs text-muted-foreground">All changes saved instantly</p>
										</div>
									</div>
									<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
										<div className="h-full w-2/3 bg-green-500 rounded-full" />
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Logos Section */}
			<section className="py-12 border-y bg-muted/20">
				<div className="container mx-auto px-4">
					<p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-8">
						Loved by teams at world-class companies
					</p>
					<div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
						{/* Placeholder logos as text + icons for minimalism */}
						<div className="flex items-center gap-2 text-xl font-bold"><Layers className="w-6 h-6" /> LAYERED</div>
						<div className="flex items-center gap-2 text-xl font-bold"><Zap className="w-6 h-6" /> VOLT</div>
						<div className="flex items-center gap-2 text-xl font-bold"><Shield className="w-6 h-6" /> SECURE</div>
						<div className="flex items-center gap-2 text-xl font-bold"><FileText className="w-6 h-6" /> DOCS</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features" className="py-24">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
							The ultimate toolkit for
							<br />organized, high-performing teams.
						</h2>
						<p className="text-lg text-muted-foreground leading-relaxed">
							Everything you need to manage your organization&apos;s collective intelligence,
							with workspace-grade security and control built-in from the ground up.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								icon: <Sparkles className="w-6 h-6" />,
								title: "Intuitive Interface",
								description: "A distraction-free writing environment that lets your thoughts flow without friction."
							},
							{
								icon: <Users className="w-6 h-6" />,
								title: "Tenant Isolation",
								description: "Rigorous data security and isolation for multi-tenant organizations."
							},
							{
								icon: <Zap className="w-6 h-6" />,
								title: "High Performance",
								description: "Lightning-fast search and real-time collaboration across your entire team."
							}
						].map((item, i) => (
							<Card key={i} className="group hover:border-primary/50 transition-all duration-300 border-border bg-card/50 backdrop-blur-sm">
								<CardContent className="p-8">
									<div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										{item.icon}
									</div>
									<h3 className="text-xl font-bold mb-3">{item.title}</h3>
									<p className="text-muted-foreground leading-relaxed text-sm">
										{item.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Workflow Section */}
			<section id="workflow" className="py-24 bg-muted/30 overflow-hidden">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div className="space-y-8 order-2 lg:order-1">
							<h2 className="text-3xl md:text-5xl font-bold tracking-tight">Simplify your workflow.</h2>
							<div className="space-y-6">
								{[
									{ t: "Draft and Organize", d: "Capture raw thoughts and structured notes in one place." },
									{ t: "Intelligent Tags", d: "Automate organization with AI-assisted tagging and categorization." },
									{ t: "Shared Workspace", d: "Collaborate across organizations with strict access controls." }
								].map((step, i) => (
									<div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-background/80 transition-colors border border-transparent hover:border-border">
										<div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
											{i + 1}
										</div>
										<div className="space-y-1">
											<h4 className="font-bold">{step.t}</h4>
											<p className="text-sm text-muted-foreground leading-relaxed">{step.d}</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="relative order-1 lg:order-2">
							<div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full" />
							<AppMockup className="relative z-10 scale-105 shadow-3xl" />
						</div>
					</div>
				</div>
			</section>

			{/* Integration Cloud */}
			<section className="py-24">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<IntegrationCloud />
						<div className="space-y-6">
							<h2 className="text-3xl md:text-5xl font-bold tracking-tight">One platform, unlimited integrations.</h2>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Connect Notal with your existing tech stack. Seamlessly sync your notes with 
								external apps while maintaining strict tenant isolation and audit trails.
							</p>
							<Button variant="outline" className="rounded-full px-8">Coming soon</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Enterprise Governance (Dark Section) */}
			<section className="py-24 bg-foreground text-background">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
						Enterprise-grade governance.
						<br />
						Built for teams that can&apos;t afford gaps.
					</h2>
					<p className="text-white/50 mb-16 max-w-xl mx-auto">On our product roadmap &mdash; designed to give your team full control and accountability over every piece of knowledge.</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
						<Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
							<CardContent className="p-8 space-y-6">
								<div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
									<RefreshCw className="w-8 h-8 text-primary" />
								</div>
								<div>
									<Badge className="mb-2 bg-blue-500/20 text-blue-400 border-none uppercase tracking-tighter text-[10px]">Coming Soon</Badge>
									<h3 className="text-2xl font-bold mb-3 text-white">Advanced Data Recovery</h3>
									<p className="text-white/50 text-sm leading-relaxed">
										Accidental deletions are a thing of the past. Our safety-net system 
										allows 30-day recovery from Trash with automated background purging.
									</p>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-colors">
							<CardContent className="p-8 space-y-6">
								<div className="flex gap-4">
									<div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
										<Zap className="w-6 h-6" />
									</div>
									<div className="flex-1 space-y-1">
										<div className="h-2 w-full bg-white/10 rounded" />
										<div className="h-2 w-2/3 bg-white/10 rounded" />
									</div>
									<div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
										<Shield className="w-6 h-6" />
									</div>
								</div>
								<div>
									<Badge className="mb-2 bg-green-500/20 text-green-400 border-none uppercase tracking-tighter text-[10px]">Coming Soon</Badge>
									<h3 className="text-2xl font-bold mb-3 text-white">Full Document Versioning</h3>
									<p className="text-white/50 text-sm leading-relaxed">
										Every edit is recorded. View, compare, and revert any note to previous 
										snapshots with complete enterprise-grade audit trails.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section id="pricing" className="py-24 relative overflow-hidden">
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] -z-10" />
				<div className="container mx-auto px-4">
					<div className="text-center max-w-2xl mx-auto mb-16">
						<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Pricing for everyone.</h2>
						<p className="text-muted-foreground">Unlock the full power of sophisticated note management.</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{SUBSCRIPTION_PLANS.map((plan, i) => (
							<Card key={i} className={`relative flex flex-col bg-card/60 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? "border-primary shadow-xl shadow-primary/10" : "border-border"}`}>
								{plan.popular && (
									<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4">Most Popular</Badge>
								)}
								<CardContent className="p-8 flex-1 flex flex-col">
									<h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">{plan.name}</h3>
									<div className="flex items-baseline gap-1 mb-6">
										<span className="text-4xl font-bold">{plan.price}</span>
										<span className="text-muted-foreground text-sm">{plan.period}</span>
									</div>
									<Link href="/signup" className="mb-8 group">
										<Button className={`w-full rounded-full h-12 ${plan.popular ? "bg-primary" : "bg-neutral-800 hover:bg-neutral-900"}`}>
											Get Started
										</Button>
									</Link>
									<p className="text-sm font-semibold mb-4 text-muted-foreground">Everything in {i === 0 ? "basic" : "previous plan"} plus:</p>
									<ul className="space-y-4 flex-1">
										{plan.features.map((f, j) => (
											<li key={j} className="flex items-start gap-2 text-sm">
												<CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
												<span>{f}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-24">
				<div className="container mx-auto px-4">
					<div className="relative rounded-[2.5rem] bg-foreground p-12 md:p-20 overflow-hidden text-center text-white">
						<div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent pointer-events-none" />
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-lavender)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
						<Badge className="mb-6 bg-white/10 text-white border-white/20 relative z-10">Join leading teams on Notal</Badge>
						<h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-10">Your knowledge,<br />perfectly organized.</h2>
						<p className="text-white/60 mb-10 max-w-lg mx-auto relative z-10">Start for free. Upgrade when your team is ready for enterprise governance.</p>
						<Link href="/signup" className="relative z-10">
							<Button size="lg" className="rounded-full px-12 h-16 text-lg bg-white text-black hover:bg-neutral-200 shadow-2xl">
								Get started &mdash; it&apos;s free
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-card border-t py-20 px-4">
				<div className="container mx-auto">
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
						<div className="col-span-2 space-y-6">
							<Link href="/" className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold">N</div>
								<span className="text-xl font-bold tracking-tight">Notal</span>
							</Link>
							<p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
								Crafting the future of team knowledge management with precision and elegance.
							</p>
							<div className="flex gap-4 text-muted-foreground">
								<Twitter className="w-5 h-5 cursor-pointer hover:text-primary" />
								<Github className="w-5 h-5 cursor-pointer hover:text-primary" />
								<Linkedin className="w-5 h-5 cursor-pointer hover:text-primary" />
							</div>
						</div>
						{[
							{ t: "Product", l: ["Features", "Security", "Pricing", "About"] },
							{ t: "Resources", l: ["Documentation", "API Reference", "Templates", "Webinars"] },
							{ t: "Legal", l: ["Terms of Service", "Privacy Policy", "Cookie Policy"] }
						].map((g, i) => (
							<div key={i} className="space-y-4">
								<h4 className="font-bold text-sm tracking-widest uppercase">{g.t}</h4>
								<ul className="space-y-2">
									{g.l.map((link) => (
										<li key={link}>
											<Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
						<p>© 2024 Notal. All rights reserved.</p>
						<p>Built with Next.js, BetterAuth, and Polar.sh</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Page;
