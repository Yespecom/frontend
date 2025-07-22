"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Users,
  Menu,
  X,
  CheckCircle,
  ChevronRight,
  Bell,
  Rocket,
  MessageSquare,
  Palette,
  Heart,
  Target,
  Award,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className="bg-white border-b border-gray-100 sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Yesp Ecom Studio Logo - Complete Ecommerce Platform"
                  width={40}
                  height={40}
                  className="w-10 h-10 sm:w-14 sm:h-14"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-bold text-slate-900">Yesp Ecom Studio</span>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit">Beta Available</Badge>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Features
              </a>
              <a href="#consulting" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Consulting
              </a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                About
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-gray-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden border-t border-gray-100 py-4 bg-white">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-slate-600 hover:text-slate-900 font-medium px-4 py-3 transition-colors rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#consulting"
                  className="text-slate-600 hover:text-slate-900 font-medium px-4 py-3 transition-colors rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Consulting
                </a>
                <a
                  href="#about"
                  className="text-slate-600 hover:text-slate-900 font-medium px-4 py-3 transition-colors rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-100">
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full justify-center text-slate-600 hover:text-slate-900 h-12">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white h-12">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-24 xl:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="bg-green-50 text-green-700 border-green-200 mb-6 sm:mb-8 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium">
              🎉 Beta Version Now Available
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight text-slate-900">
              The complete
              <br />
              ecommerce platform
              <br />
              for everyone
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
              Start, run, and grow your business with our comprehensive ecommerce platform. Get your storefront built
              FREE by our expert team. Join over <span className="font-semibold text-slate-900">500+ beta users</span>{" "}
              who are already building their online stores with Yesp Ecom Studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold h-12 sm:h-auto"
                >
                  <Rocket className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Get Started
                </Button>
              </Link>
              <a
                href="https://calendly.com/contact-yesptech/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-slate-200 text-slate-700 hover:bg-slate-50 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-transparent h-12 sm:h-auto"
                >
                  <MessageSquare className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Book Consultation
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 px-4 sm:px-0">
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                FREE store creation
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                Built by our team
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2" />
                24/7 support
              </div>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-100">
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 hidden sm:block bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200">
                    yesp-ecom-studio.com/dashboard
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <div className="h-6 sm:h-8 bg-slate-100 rounded-lg"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="h-20 sm:h-24 bg-white rounded-xl border border-gray-200 shadow-sm"></div>
                    <div className="h-20 sm:h-24 bg-white rounded-xl border border-gray-200 shadow-sm"></div>
                    <div className="h-20 sm:h-24 bg-white rounded-xl border border-gray-200 shadow-sm"></div>
                  </div>
                  <div className="h-24 sm:h-32 bg-white rounded-xl border border-gray-200 shadow-sm"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="h-16 sm:h-20 bg-white rounded-lg border border-gray-200 shadow-sm"></div>
                    <div className="h-16 sm:h-20 bg-white rounded-lg border border-gray-200 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
              Trusted by Growing Businesses
            </h2>
            <p className="text-lg sm:text-xl text-slate-600">
              Join hundreds of merchants already using our beta platform
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 text-center max-w-2xl mx-auto">
            <div className="group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">99.9%</div>
              <div className="text-slate-600 text-base sm:text-lg">Uptime</div>
            </div>
            <div className="group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">24/7</div>
              <div className="text-slate-600 text-base sm:text-lg">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Consulting Section */}
      <section id="consulting" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="bg-green-50 text-green-700 border-green-200 mb-4 sm:mb-6">FREE Consulting Services</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              FREE Storefront Creation by Our Team
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Get your professional online store built completely FREE by our expert team. We handle everything from
              design to launch - no cost to you.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                    FREE Custom Design & Branding
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Our design team will create a unique storefront that perfectly represents your brand - completely
                    free of charge.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                    FREE Performance Optimization
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    We'll optimize your store for speed, SEO, and conversions at no cost to ensure maximum performance
                    and sales potential.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">FREE Setup & Training</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Get comprehensive training on managing your store and free setup assistance to help you launch
                    successfully.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">
                  Get Your FREE Store Built!
                </h3>
                <p className="text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                  Book a free consultation with our team to discuss your business needs. We'll build your complete
                  storefront at no cost to you.
                </p>
                <div className="space-y-4">
                  <a
                    href="https://calendly.com/contact-yesptech/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white h-12 sm:h-auto">
                      <MessageSquare className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                      Get FREE Store Built
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="bg-slate-50 text-slate-700 border-slate-200 mb-4 sm:mb-6">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              Everything you need to sell online
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to launch, manage, and grow your online
              business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Real-time Analytics",
                desc: "Get instant insights into your sales, customers, and inventory with comprehensive analytics dashboard and reporting tools.",
              },
              {
                icon: Users,
                title: "Customer Management",
                desc: "Advanced customer profiles, segmentation, and communication tools to build lasting relationships with your customers.",
              },
              {
                icon: Globe,
                title: "Multi-Channel Sales",
                desc: "Sell everywhere your customers are - web, mobile, social media, and marketplaces, all managed from one place.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Accept payments safely with built-in fraud protection, PCI compliance, and support for multiple payment methods.",
              },
              {
                icon: Zap,
                title: "Smart Automation",
                desc: "Automate repetitive tasks like inventory management, order processing, and customer communications to save time.",
              },
              {
                icon: Rocket,
                title: "Easy Setup",
                desc: "Get your store up and running in minutes with our intuitive setup wizard and pre-built templates.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 p-6 sm:p-8"
              >
                <CardContent className="p-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4 sm:mb-6">{feature.desc}</p>
                  <div className="flex items-center text-slate-600 font-medium hover:text-slate-900 transition-colors">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-4 sm:mb-6">About Us</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              Built by entrepreneurs, for entrepreneurs
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              We understand the challenges of starting and growing an online business because we've been there. That's
              why we created Yesp Ecom Studio - to make ecommerce accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center mb-16 sm:mb-20">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Our Mission</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To democratize ecommerce by providing powerful, easy-to-use tools that help businesses of all sizes
                    succeed online. We believe everyone deserves access to professional ecommerce solutions.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To become the go-to platform for entrepreneurs and businesses looking to establish and grow their
                    online presence, providing not just tools but complete solutions and expert guidance.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Our Commitment</h3>
                  <p className="text-slate-600 leading-relaxed">
                    We're committed to your success. That's why we offer free store creation, 24/7 support, and
                    continuous platform improvements based on your feedback and needs.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">
                  Why Choose Yesp Ecom Studio?
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Expert Team</h4>
                      <p className="text-slate-600 text-sm">
                        Our team of designers and developers will build your store for free
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Comprehensive Platform</h4>
                      <p className="text-slate-600 text-sm">
                        Everything you need in one place - no need for multiple tools
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Ongoing Support</h4>
                      <p className="text-slate-600 text-sm">24/7 customer support and regular platform updates</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Beta Advantage</h4>
                      <p className="text-slate-600 text-sm">
                        Get early access to new features and help shape the platform
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">500+</div>
              <div className="text-slate-600 text-base sm:text-lg">Beta Users</div>
            </div>
            <div className="group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">100+</div>
              <div className="text-slate-600 text-base sm:text-lg">Stores Built</div>
            </div>
            <div className="group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">5★</div>
              <div className="text-slate-600 text-base sm:text-lg">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-6 sm:mb-8">
            <Badge className="bg-white/10 text-white border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
              Beta Available Now
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            Ready to start your online business?
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 mb-8 sm:mb-12 leading-relaxed">
            Join hundreds of merchants who are already using our beta platform to build and grow their online stores.
            Get your <span className="font-bold text-white">FREE storefront built by our team</span> or start building
            yourself today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-gray-100 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold h-12 sm:h-auto"
              >
                <Rocket className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Get Started
              </Button>
            </Link>
            <a
              href="https://calendly.com/contact-yesptech/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold bg-transparent h-12 sm:h-auto"
              >
                <MessageSquare className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Book Consultation
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-slate-200 text-sm sm:text-base">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2" />
              FREE store creation
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2" />
              Built by experts
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2" />
              24/7 support
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Yesp Ecom Studio Logo"
                    width={48}
                    height={48}
                    className="w-12 h-12 sm:w-16 sm:h-16"
                  />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">Yesp Ecom Studio</span>
              </div>
              <p className="text-slate-600 mb-6 sm:mb-8 max-w-md leading-relaxed text-base sm:text-lg">
                The complete ecommerce platform for modern businesses. Get your store built FREE by our expert team or
                use our comprehensive suite of tools to build it yourself.
              </p>
              <Badge className="bg-green-50 text-green-700 border-green-200">Beta Available</Badge>
            </div>
            <div>
              <h4 className="font-bold mb-4 sm:mb-6 text-lg sm:text-xl text-slate-900">Product</h4>
              <ul className="space-y-3 sm:space-y-4 text-slate-600">
                <li>
                  <a href="#features" className="hover:text-slate-900 transition-colors text-base">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#consulting" className="hover:text-slate-900 transition-colors text-base">
                    Consulting
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-slate-900 transition-colors text-base">
                    About
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-slate-600 text-sm sm:text-base text-center sm:text-left">
              © 2025 Yesp Ecom Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
