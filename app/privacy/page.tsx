"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Globe,
  ArrowLeft,
  Calendar,
  Mail,
  FileText,
  Settings,
  Trash2,
  Download,
} from "lucide-react"

export default function PrivacyPage() {
  const lastUpdated = "January 15, 2024"

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal Information: We collect information you provide directly, such as your name, email address, phone number, and payment information when you create an account or make a purchase.",
        "Usage Information: We automatically collect information about how you use our service, including your IP address, browser type, operating system, and pages visited.",
        "Store Information: When you create a store, we collect information about your products, customers, orders, and store settings.",
        "Communication Data: We may collect information from your communications with us, including support requests and feedback.",
      ],
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Settings,
      content: [
        "Service Provision: We use your information to provide, maintain, and improve our e-commerce platform services.",
        "Communication: We use your contact information to send you service-related notifications, updates, and marketing communications (with your consent).",
        "Analytics: We analyze usage patterns to improve our service and develop new features.",
        "Security: We use your information to detect, prevent, and address technical issues and security threats.",
        "Legal Compliance: We may use your information to comply with legal obligations and protect our rights.",
      ],
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Users,
      content: [
        "Service Providers: We may share your information with third-party service providers who help us operate our platform, such as payment processors and hosting providers.",
        "Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
        "Legal Requirements: We may disclose your information if required by law or in response to valid legal requests.",
        "Consent: We may share your information with your explicit consent for specific purposes.",
        "We do not sell, rent, or trade your personal information to third parties for marketing purposes.",
      ],
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: [
        "Encryption: We use industry-standard encryption to protect your data in transit and at rest.",
        "Access Controls: We implement strict access controls to ensure only authorized personnel can access your information.",
        "Regular Audits: We conduct regular security audits and assessments to identify and address potential vulnerabilities.",
        "Incident Response: We have procedures in place to respond quickly to any security incidents.",
        "While we implement strong security measures, no system is 100% secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: FileText,
      content: [
        "Account Data: We retain your account information for as long as your account is active or as needed to provide services.",
        "Transaction Data: We retain transaction and order data for accounting and legal compliance purposes, typically for 7 years.",
        "Usage Data: We may retain anonymized usage data indefinitely for analytics and service improvement purposes.",
        "Deletion Requests: You can request deletion of your personal data, subject to legal and contractual obligations.",
      ],
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      icon: Eye,
      content: [
        "Access: You have the right to access and review the personal information we have about you.",
        "Correction: You can request correction of inaccurate or incomplete personal information.",
        "Deletion: You can request deletion of your personal information, subject to certain exceptions.",
        "Portability: You can request a copy of your personal information in a portable format.",
        "Opt-out: You can opt out of marketing communications at any time.",
        "These rights may vary depending on your location and applicable privacy laws.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: Globe,
      content: [
        "Essential Cookies: We use cookies that are necessary for the operation of our service.",
        "Analytics Cookies: We use cookies to understand how you use our service and improve user experience.",
        "Marketing Cookies: With your consent, we may use cookies for targeted advertising and marketing.",
        "Third-party Cookies: Some third-party services we use may set their own cookies.",
        "You can control cookie settings through your browser, but disabling certain cookies may affect service functionality.",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <Image src="/logo.png" alt="Yesp Ecom Studio Logo" width={48} height={48} className="w-12 h-12" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Yesp Ecom Studio</span>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs w-fit">Privacy</Badge>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal
            information when you use Yesp Ecom Studio.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Last updated: {lastUpdated}
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              <a href="mailto:privacy@yesp.com" className="text-green-600 hover:underline">
                privacy@yesp.com
              </a>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={section.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-900">{section.title}</span>
                  <Badge variant="outline" className="ml-auto">
                    {index + 1}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy Rights Actions */}
        <Card className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-900">Exercise Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
              You have control over your personal information. Use the options below to manage your privacy preferences
              and exercise your rights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                <Eye className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium">View My Data</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                <Download className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Export Data</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                <Settings className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium">Privacy Settings</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                <Trash2 className="w-6 h-6 text-red-600" />
                <span className="text-sm font-medium">Delete Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Questions?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your personal information, our
              privacy team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="mailto:privacy@yesp.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Privacy Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/terms">
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Trust & Transparency</h3>
          <p className="text-gray-600 mb-6">
            We're committed to protecting your privacy and being transparent about our data practices. Start building
            your store with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/register">Create Your Store</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
