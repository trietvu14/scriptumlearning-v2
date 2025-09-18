import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const demoRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  title: z.string().min(1, "Title/Position is required").max(100, "Title must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  school: z.string().min(1, "School name is required").max(200, "School name must be less than 200 characters"),
  phoneNumber: z.string().max(20, "Phone number must be less than 20 characters").optional().or(z.literal(""))
});

type DemoRequestFormData = z.infer<typeof demoRequestSchema>;

export default function DemoRequestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<DemoRequestFormData>({
    resolver: zodResolver(demoRequestSchema)
  });

  const createDemoRequestMutation = useMutation({
    mutationFn: async (data: DemoRequestFormData) => {
      const response = await apiRequest("POST", "/api/demo-requests", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      toast({
        title: "Demo request submitted!",
        description: "We'll contact you soon to schedule your demo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: DemoRequestFormData) => {
    createDemoRequestMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Request Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your interest in Scriptum Learning. We'll contact you within 24 hours to schedule your personalized demo.
            </p>
            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Homepage
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
                data-testid="button-submit-another"
              >
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Homepage
          </Button>
        </Link>
      </header>

      {/* Form Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Request a Demo
              </CardTitle>
              <CardDescription className="text-center">
                Experience Scriptum Learning's AI-powered curriculum mapping platform. 
                Fill out the form below and we'll schedule a personalized demonstration for your institution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      {...register("fullName")}
                      placeholder="Enter your full name"
                      data-testid="input-full-name"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-full-name">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">Title/Position *</Label>
                    <Input
                      id="title"
                      type="text"
                      {...register("title")}
                      placeholder="e.g., Dean, Curriculum Director, Professor"
                      data-testid="input-title"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-title">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Enter your email address"
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-email">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="school">School/Institution *</Label>
                    <Input
                      id="school"
                      type="text"
                      {...register("school")}
                      placeholder="Enter your institution name"
                      data-testid="input-school"
                    />
                    {errors.school && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-school">
                        {errors.school.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register("phoneNumber")}
                      placeholder="Enter your phone number"
                      data-testid="input-phone"
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-phone">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createDemoRequestMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createDemoRequestMutation.isPending ? "Submitting..." : "Request Demo"}
                  </Button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  By submitting this form, you agree to be contacted by our team to schedule and provide your demo.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}