import Link from "next/link";
import {
  Film,
  Sparkles,
  ImageIcon,
  Video,
  ArrowRight,
  Wand2,
  Zap,
  Star,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>

      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 glass rounded-full mb-8 animate-glow">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold gradient-text">
              AI-Powered Creative Studio
            </span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>

          {/* Main Headline */}
          <h1 className="text-7xl md:text-8xl font-black mb-8 leading-[1.1]">
            <span className="block gradient-text">Create Cinematic</span>
            <span className="block text-white">Videos with AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Transform your ideas into stunning visual stories.
            <span className="gradient-text font-bold">
              {" "}
              No filming required.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <Link href="/projects">
              <Button
                size="lg"
                className="text-lg px-10 py-7 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 font-bold border-0"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Creating Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 glass text-white border-white/20 hover:bg-white/10 font-bold"
            >
              <Film className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold">No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">
                Generate in Minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-white font-semibold">
                Unlimited Creativity
              </span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <Card className="glass border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 group">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-purple-500/50">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white font-bold">
                Story Generation
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                AI-powered narrative creation from your imagination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  Multi-genre support
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  Character development
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  Scene breakdown
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 hover:border-pink-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 group">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-pink-500/50">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white font-bold">
                Image Generation
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Transform scenes into stunning cinematic visuals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                  Cinematic composition
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                  Character consistency
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                  Style customization
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 group">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-orange-500/50">
                <Video className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white font-bold">
                Video Assembly
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Bring your story to life with motion and sound
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                  AI motion cues
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                  Voice narration
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                  Export ready
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-32 max-w-5xl mx-auto">
          <Card className="glass border-white/20 relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20"></div>

            <CardHeader className="text-center pb-8 relative z-10">
              <div className="inline-flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                <Sparkles
                  className="w-8 h-8 text-pink-400 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <Sparkles
                  className="w-6 h-6 text-purple-400 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
              <CardTitle className="text-5xl font-black mb-6 text-white">
                Ready to Create Magic?
              </CardTitle>
              <CardDescription className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of creators turning their imagination into
                stunning cinematic videos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center relative z-10 pb-12">
              <Link href="/projects">
                <Button
                  size="lg"
                  className="text-xl px-16 py-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 font-bold border-0"
                >
                  <Rocket className="w-6 h-6 mr-3" />
                  Start Creating Now
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <p className="text-gray-400 mt-6 text-sm">
                No credit card required • Free to start
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
