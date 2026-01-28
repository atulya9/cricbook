import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to feed
  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
              <span className="text-xl">🏏</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Cricbook</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                The Social Network for{" "}
                <span className="text-green-600">Cricket Fans</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Share your cricket moments, follow live matches, discuss with fans
                worldwide, and stay updated with everything cricket.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                    Get Started — It&apos;s Free
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8"
                  >
                    Explore
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative">
              <div className="cricket-gradient rounded-3xl p-8 text-white shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                      🏏
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Live Match</p>
                      <p className="text-white/80">IND vs AUS • Day 2</p>
                    </div>
                  </div>
                  <div className="space-y-3 bg-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">🇮🇳 India</span>
                      <span className="text-2xl font-bold">324/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">🇦🇺 Australia</span>
                      <span className="text-2xl font-bold">156/3</span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm text-white/80">Trending now</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                        #INDvAUS
                      </span>
                      <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                        #TestCricket
                      </span>
                      <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
                        #ViratKohli
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Everything Cricket, One Platform
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon="📱"
                title="Live Match Updates"
                description="Get real-time scores, ball-by-ball commentary, and instant notifications for your favorite matches."
              />
              <FeatureCard
                icon="💬"
                title="Fan Discussions"
                description="Share your thoughts, join conversations, and connect with cricket enthusiasts from around the world."
              />
              <FeatureCard
                icon="📊"
                title="Stats & Predictions"
                description="Access detailed player statistics, match predictions, and fantasy cricket insights."
              />
              <FeatureCard
                icon="🔔"
                title="Custom Notifications"
                description="Follow your favorite teams and players. Never miss an important moment."
              />
              <FeatureCard
                icon="🏆"
                title="All Formats"
                description="Coverage for Tests, ODIs, T20s, IPL, World Cup, and all major cricket tournaments."
              />
              <FeatureCard
                icon="📷"
                title="Share Moments"
                description="Post photos, videos, and create polls to engage with the cricket community."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Join the Cricket Community?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sign up now and connect with millions of cricket fans worldwide.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-12">
                Create Your Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                  <span className="text-xl">🏏</span>
                </div>
                <span className="text-xl font-bold">Cricbook</span>
              </div>
              <p className="text-gray-400">
                The ultimate social network for cricket fans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/explore" className="hover:text-white">Explore</Link></li>
                <li><Link href="/matches" className="hover:text-white">Live Matches</Link></li>
                <li><Link href="/trending" className="hover:text-white">Trending</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Cricbook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
