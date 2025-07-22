"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import {
  FileText,
  Shield,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Globe,
  Mail,
} from "lucide-react"

export default function TermsPage() {
  const lastUpdated = "January 15, 2024"

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        "By accessing and using Yesp Ecom Studio ('the Service'), you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms apply to all visitors, users, and others who access or use the service.",
      ],
    },
    {
      id: "description",
      title: "Service Description",
      icon: Globe,
      content: [
        "Yesp Ecom Studio is a comprehensive e-commerce platform that enables users to create, manage, and operate online stores.",
        "Our service includes but is not limited to: store creation tools, payment processing, inventory management, customer management, and analytics.",
        "We reserve the right to modify, suspend, or discontinue any part of our service at any time.",
      ],
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      icon: Users,
      content: [
        "You must create an account to use certain features of our service.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree to provide accurate, current, and complete information during registration.",
        "You are responsible for all activities that occur under your account.",
        "You must notify us immediately of any unauthorized use of your account.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: Shield,
      content: [
        "You may not use our service for any unlawful purposes or to conduct any unlawful activity.",
        "You may not use our service to transmit, distribute, or store material that violates applicable laws.",
        "You may not attempt to gain unauthorized access to our systems or networks.",
        "You may not interfere with or disrupt the integrity or performance of our service.",
        "You may not use our service to send spam or unsolicited communications.",
      ],
    },
    {
      id: "payment-terms",
      title: "Payment Terms",
      icon: CreditCard,
      content: [
        "Our service operates on a subscription-based model with various pricing tiers.",
        "All fees are charged in advance on a monthly or annual basis.",
        "All fees are non-refundable except as required by law or as specifically stated in our refund policy.",
        "We reserve the right to change our pricing with 30 days' notice.",
        "Failure to pay fees may result in suspension or termination of your account.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: FileText,
      content: [
        "The service and its original content, features, and functionality are owned by Yesp Ecom Studio.",
        "Our service is protected by copyright, trademark, and other laws.",
        "You retain ownership of content you upload to our service.",
        "By uploading content, you grant us a license to use, modify, and display that content in connection with our service.",
      ],
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: AlertTriangle,
      content: [
        "Our service is provided 'as is' without warranties of any kind.",
        "We shall not be liable for any indirect, incidental, special, or consequential damages.",
        "Our total liability shall not exceed the amount paid by you for the service in the 12 months preceding the claim.",
        "Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability.",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs w-fit">Legal</Badge>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Please read these terms carefully before using our service. By using Yesp Ecom Studio, you agree to these
            terms.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Last updated: {lastUpdated}
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              <a href="mailto:legal@yesp.com" className="text-blue-600 hover:underline">
                legal@yesp.com
              </a>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={section.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-blue-600" />
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

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please don't hesitate to contact our legal team.
              We're here to help clarify any concerns you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="mailto:legal@yesp.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Legal Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/privacy">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6">
            By creating an account, you agree to these terms and can start building your online store today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
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
