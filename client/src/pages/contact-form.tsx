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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  jobTitle: z.string().min(1, "Job title is required").max(100, "Job title must be less than 100 characters"),
  institutionName: z.string().min(1, "Institution name is required").max(200, "Institution name must be less than 200 characters"),
  schoolCollege: z.string().min(1, "School/College is required").max(200, "School/College must be less than 200 characters"),
  disciplineArea: z.string().min(1, "Discipline area is required").max(100, "Discipline area must be less than 100 characters"),
  phoneNumber: z.string().max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
  referralSource: z.enum(["search_engine", "linkedin", "social_media", "referral", "news_blog"])
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactFormPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      toast({
        title: "Contact form submitted!",
        description: "Thank you for your interest. We'll get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting form",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContactFormData) => {
    createContactMutation.mutate(data);
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
              Thank You!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your interest in Scriptum Learning. We'll contact you within 24 hours to discuss how we can help your institution.
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
                Get Started Today
              </CardTitle>
              <CardDescription className="text-center">
                Ready to transform your curriculum management? Fill out the form below and our team will contact you to discuss how Scriptum Learning can benefit your institution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...register("firstName")}
                      placeholder="Enter your first name"
                      data-testid="input-first-name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-first-name">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...register("lastName")}
                      placeholder="Enter your last name"
                      data-testid="input-last-name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1" data-testid="error-last-name">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
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
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    type="text"
                    {...register("jobTitle")}
                    placeholder="e.g., Dean, Curriculum Director, Professor"
                    data-testid="input-job-title"
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-job-title">
                      {errors.jobTitle.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="institutionName">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    type="text"
                    {...register("institutionName")}
                    placeholder="Enter your institution name"
                    data-testid="input-institution"
                  />
                  {errors.institutionName && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-institution">
                      {errors.institutionName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="schoolCollege">School/College *</Label>
                  <Input
                    id="schoolCollege"
                    type="text"
                    {...register("schoolCollege")}
                    placeholder="e.g., School of Medicine, College of Dentistry"
                    data-testid="input-school-college"
                  />
                  {errors.schoolCollege && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-school-college">
                      {errors.schoolCollege.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="disciplineArea">Discipline/Area *</Label>
                  <Input
                    id="disciplineArea"
                    type="text"
                    {...register("disciplineArea")}
                    placeholder="e.g., Medicine, Dentistry, Nursing, Engineering"
                    data-testid="input-discipline"
                  />
                  {errors.disciplineArea && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-discipline">
                      {errors.disciplineArea.message}
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

                <div>
                  <Label htmlFor="referralSource">How did you find us? *</Label>
                  <Select onValueChange={(value) => setValue("referralSource", value as any)} data-testid="select-referral">
                    <SelectTrigger>
                      <SelectValue placeholder="Select how you found us" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search_engine">Search Engine (Google, Bing, etc.)</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="referral">Referral from colleague/friend</SelectItem>
                      <SelectItem value="news_blog">News/Blog article</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.referralSource && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-referral">
                      {errors.referralSource.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Tell us about your specific needs, questions, or how we can help your institution..."
                    className="min-h-[100px]"
                    data-testid="textarea-message"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-message">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createContactMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createContactMutation.isPending ? "Submitting..." : "Get Started Today"}
                  </Button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  By submitting this form, you agree to be contacted by our team to discuss how we can help your institution.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}