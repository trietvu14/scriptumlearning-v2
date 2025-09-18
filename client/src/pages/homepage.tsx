import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import scriptumLogo from "@assets/Scriptum-logo_1756408112211.png";
import professorImage from "@assets/stock_images/professional_college_66672c37.jpg";

export function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img
            src={scriptumLogo}
            alt="Scriptum Learning"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scriptum Learning
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            data-testid="button-request-demo"
            asChild
          >
            <Link href="/demo-request">Request Demo</Link>
          </Button>
          <Button variant="outline" data-testid="button-sign-in" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-5xl font-bold text-white mb-6">
                  Automate Curriculum Mapping Using AI!
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Transform your curriculum with AI-powered mapping. Scriptum
                  tracks course changes in real time, aligns content to national
                  boards and accreditation standards, and delivers insights that
                  reveal how curriculum updates impact student outcomes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-3"
                    data-testid="button-get-started"
                    asChild
                  >
                    <Link href="/contact">
                      Get started today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-3 bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                    data-testid="button-request-demo-hero"
                    asChild
                  >
                    <Link href="/demo-request">Request Demo</Link>
                  </Button>
                </div>
              </div>

              {/* Professor Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl transform rotate-3"></div>
                  <img
                    src={professorImage}
                    alt="College professor teaching in classroom"
                    className="relative rounded-2xl shadow-2xl w-full max-w-lg h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Scriptum Learning?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to elevate educational outcomes in one platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card
            className="text-center p-6 hover:shadow-lg transition-shadow"
            data-testid="card-feature-mapping"
          >
            <CardContent className="pt-6">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Curriculum Mapping
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Align your curriculum with educational standards and track
                learning outcomes effectively.
              </p>
            </CardContent>
          </Card>

          <Card
            className="text-center p-6 hover:shadow-lg transition-shadow"
            data-testid="card-feature-ai"
          >
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Insights
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Get intelligent recommendations and data-driven insights to
                improve educational outcomes.
              </p>
            </CardContent>
          </Card>

          <Card
            className="text-center p-6 hover:shadow-lg transition-shadow"
            data-testid="card-feature-progress"
          >
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Student Progress
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor student development with comprehensive tracking and
                reporting tools.
              </p>
            </CardContent>
          </Card>

          <Card
            className="text-center p-6 hover:shadow-lg transition-shadow"
            data-testid="card-feature-review"
          >
            <CardContent className="pt-6">
              <GraduationCap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Board Review
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Prepare students for certification with targeted review
                materials and assessments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Educational Institution?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of educators who are already using Scriptum Learning
            to enhance their teaching and improve student outcomes.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-3"
            data-testid="button-start-free"
            asChild
          >
            <Link href="/contact">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 Scriptum Learning. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Homepage;
