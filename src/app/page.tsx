'use client'
// Force Vercel build 2
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Brain, Zap, Shield, Sparkles, ArrowRight, Bot, Cloud, Cpu } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (user && token) {
      router.replace('/chat')
      return
    }
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [router])

  const features = [
    { icon: Brain, title: 'Ultra-Fast AI', desc: 'Access Groq powered by Llama 3 models from one unified interface.' },
    { icon: Zap, title: 'Real-Time Streaming', desc: 'Watch AI responses appear in real-time with smooth, efficient streaming.' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your API keys stay server-side. Never exposed to the frontend.' },
    { icon: Bot, title: 'Smart Formatting', desc: 'Beautiful markdown, syntax highlighting, and rich code blocks.' },
    { icon: Cloud, title: 'Cloud Sync', desc: 'Your conversations sync seamlessly across all your devices.' },
    { icon: Cpu, title: 'Ultra-Fast', desc: 'Optimized performance with blazing-fast response times.' },
  ]

  const stats = [
    { value: '7+', label: 'AI Providers' },
    { value: '200+', label: 'Models' },
    { value: '100K+', label: 'Context Window' },
    { value: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-soft' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="lumiox logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-xl text-text-primary/70 tracking-wide">lumiox</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/chat"
                className="relative px-5 py-2.5 bg-accent-600 text-white text-sm font-medium rounded-xl hover:bg-accent-700 transition-all shadow-soft hover:shadow-md active:scale-[0.98] overflow-hidden group">
                <span className="relative z-10">Open Chat</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all border border-border hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:border-accent-500/30 active:scale-[0.98]">
                  Sign In
                </Link>
                <Link href="/register"
                  className="relative px-5 py-2.5 bg-accent-600 text-white text-sm font-medium rounded-xl hover:bg-accent-700 transition-all shadow-soft hover:shadow-md active:scale-[0.98] overflow-hidden group">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 mesh-gradient overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/3 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-500/10 backdrop-blur-sm rounded-full text-sm text-accent-600 dark:text-accent-400 font-medium mb-6 border border-accent-500/20">
            <Sparkles className="w-4 h-4" /> Premium lumiox Experience
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary mb-6 leading-[1.1] tracking-tight">
            Chat with AI,
            <br />
            <span className="bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 bg-clip-text text-transparent">Beautifully</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Access the most powerful AI models through one elegant, unified interface.
            <br className="hidden sm:block" />
            Experience premium AI chat with real-time streaming and smart formatting.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={isLoggedIn ? '/chat' : '/register'}
              className="relative group px-8 py-4 bg-accent-600 text-white font-medium rounded-2xl hover:bg-accent-700 transition-all shadow-soft hover:shadow-lg hover:shadow-accent-500/20 active:scale-[0.98] flex items-center gap-2 overflow-hidden">
              <span className="relative z-10">{isLoggedIn ? 'Open Chat' : 'Start Chatting'}</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
            </Link>
            <Link href="#features"
              className="px-8 py-4 text-text-secondary font-medium rounded-2xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all border border-border hover:border-accent-500/20 active:scale-[0.98]">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border bg-surface/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-text-secondary mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Powerful Features</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Everything you need for an exceptional AI chat experience — all in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i}
                className="group relative p-6 bg-surface border border-border rounded-2xl hover:shadow-soft-lg hover:border-accent-500/20 transition-all duration-200 card-hover">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500/10 to-accent-600/10 border border-accent-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-accent-500/20 group-hover:to-accent-600/20 transition-all duration-200">
                  <f.icon className="w-5 h-5 text-accent-500" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-24 px-6 bg-surface/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">Supported AI Providers</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">Connect to the world's leading AI models through a single unified interface.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Groq', color: '#F55036', desc: 'Ultra-fast inference' },
            ].map((p, i) => (
              <div key={i}
                className="group relative p-5 bg-surface border border-border rounded-2xl hover:shadow-soft-lg transition-all duration-200 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: p.color }}>
                  {p.name[0]}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-0.5">{p.name}</h3>
                <p className="text-xs text-text-secondary/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-y border-border bg-accent-600/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">Ready to Get Started?</h2>
          <p className="text-lg text-text-secondary mb-8">Join thousands of users who rely on lumiox for their daily workflow.</p>
          <Link href={isLoggedIn ? '/chat' : '/register'}
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-accent-600 text-white font-medium rounded-2xl hover:bg-accent-700 transition-all shadow-soft hover:shadow-lg hover:shadow-accent-500/20 active:scale-[0.98] group overflow-hidden">
            <span className="relative z-10">{isLoggedIn ? 'Open Chat' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <img src="/logo.png" alt="lumiox logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-semibold text-text-primary/70 tracking-wide">lumiox</span>
          </div>
          <p className="text-xs text-text-secondary">© 2026 lumiox. Built with modern technology.</p>
        </div>
      </footer>
    </div>
  )
}
