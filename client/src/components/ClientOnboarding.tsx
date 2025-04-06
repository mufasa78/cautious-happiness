import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientProjectSchema } from '@shared/schema';
import type { ClientProjectSubmission } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  PROJECT_TYPES, 
  PROJECT_FEATURES, 
  BUDGET_RANGES, 
  TIMELINE_OPTIONS 
} from '@/lib/constants';

// Extend the schema for client-side validation
const clientFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(5, { message: 'Phone number is required' }),
  company: z.string().optional(),
  address: z.string().optional(),
  
  projectType: z.string().min(1, { message: 'Project type is required' }),
  description: z.string().min(10, { message: 'Project description is required (min 10 characters)' }),
  features: z.array(z.string()).optional(),
  
  budget: z.string().min(1, { message: 'Budget range is required' }),
  timeline: z.string().min(1, { message: 'Timeline is required' }),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  additionalRequirements: z.string().optional(),
  
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});

type OnboardingFormData = z.infer<typeof clientFormSchema>;

const ClientOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      projectType: '',
      description: '',
      features: [],
      budget: '',
      timeline: '',
      startDate: '',
      deadline: '',
      additionalRequirements: '',
      termsAgreed: false
    }
  });

  const onboardingMutation = useMutation({
    mutationFn: (data: ClientProjectSubmission) => 
      apiRequest('POST', '/api/client-onboarding', data),
    onSuccess: () => {
      setFormSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your project request has been submitted successfully. I'll get back to you soon!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: OnboardingFormData) => {
    onboardingMutation.mutate(data);
  };

  const goToNextStep = () => {
    const fieldsToValidate: Record<number, string[]> = {
      1: ['fullName', 'email', 'phone'],
      2: ['projectType', 'description'],
      3: ['budget', 'timeline']
    };

    const currentFields = fieldsToValidate[currentStep as keyof typeof fieldsToValidate] || [];
    
    // Trigger validation only on the fields for the current step
    const isValid = currentFields.every(field => {
      const result = form.trigger(field as any);
      return result;
    });

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Maps each stepNumber to an icon name
  const stepIcons: Record<number, string> = {
    1: 'user',
    2: 'project-diagram',
    3: 'calendar-alt',
    4: 'check'
  };

  // Calculate the width of the progress bar based on current step
  const progressWidth = `${(currentStep * 25)}%`;

  if (formSubmitted) {
    return (
      <div id="form-success" className="text-center py-12">
        <div className="text-5xl text-green-500 mb-6">
          <i className="fas fa-check-circle"></i>
        </div>
        <h3 className="text-2xl font-bold mb-4">Request Submitted Successfully!</h3>
        <p className="text-gray-600 mb-8">
          Thank you for submitting your project request. I'll review the details and get back to you within 24-48 hours.
        </p>
        <Button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Back to Homepage
        </Button>
      </div>
    );
  }

  return (
    <section id="hire" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Work With Me</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Let's start your project by gathering some information about your needs.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Form Progress Steps */}
          <div className="mb-10">
            <div className="flex justify-between">
              {[1, 2, 3, 4].map(stepNumber => (
                <div 
                  key={stepNumber}
                  className="w-1/4 text-center" 
                  data-step={stepNumber}
                >
                  <div 
                    className={`relative mx-auto w-10 h-10 rounded-full 
                      ${currentStep >= stepNumber ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'} 
                      flex items-center justify-center mb-2 z-10`}
                  >
                    <i className={`fas fa-${stepIcons[stepNumber]}`}></i>
                  </div>
                  <p 
                    className={`${currentStep >= stepNumber ? 'text-primary' : 'text-gray-500'} 
                      font-medium text-sm`}
                  >
                    {stepNumber === 1 && 'Personal Info'}
                    {stepNumber === 2 && 'Project Details'}
                    {stepNumber === 3 && 'Budget & Timeline'}
                    {stepNumber === 4 && 'Review & Submit'}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-300"></div>
              <div 
                className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300"
                style={{ width: progressWidth }}
              ></div>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Step 1: Personal Information */}
              <div className={`form-step ${currentStep === 1 ? 'block' : 'hidden'}`}>
                <h3 className="text-2xl font-bold mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          {...field} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="button"
                    onClick={goToNextStep}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Next Step <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </div>
              </div>
              
              {/* Step 2: Project Details */}
              <div className={`form-step ${currentStep === 2 ? 'block' : 'hidden'}`}>
                <h3 className="text-2xl font-bold mb-6">Project Details</h3>
                
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Project Type *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Select Project Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Project Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          {...field} 
                          placeholder="Please describe your project, goals, and any specific requirements..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mb-6">
                  <FormLabel>Project Features</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROJECT_FEATURES.map((feature) => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature.label)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, feature.label])
                                      : field.onChange(
                                          currentValue.filter(
                                            (value) => value !== feature.label
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {feature.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    onClick={goToPrevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Previous
                  </Button>
                  <Button 
                    type="button"
                    onClick={goToNextStep}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Next Step <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </div>
              </div>
              
              {/* Step 3: Budget & Timeline */}
              <div className={`form-step ${currentStep === 3 ? 'block' : 'hidden'}`}>
                <h3 className="text-2xl font-bold mb-6">Budget & Timeline</h3>
                
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Estimated Budget *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Select Budget Range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUDGET_RANGES.map((budget) => (
                            <SelectItem key={budget.value} value={budget.value}>
                              {budget.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Expected Timeline *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Select Timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMELINE_OPTIONS.map((timeline) => (
                            <SelectItem key={timeline.value} value={timeline.value}>
                              {timeline.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Preferred Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Hard Deadline (if any)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="additionalRequirements"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Additional Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          {...field} 
                          placeholder="Any additional information about timeline or budget constraints..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    onClick={goToPrevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Previous
                  </Button>
                  <Button 
                    type="button"
                    onClick={goToNextStep}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Next Step <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </div>
              </div>
              
              {/* Step 4: Review & Submit */}
              <div className={`form-step ${currentStep === 4 ? 'block' : 'hidden'}`}>
                <h3 className="text-2xl font-bold mb-6">Review & Submit</h3>
                
                <div className="mb-6 bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold text-lg mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Name</p>
                      <p className="font-medium">{form.getValues().fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="font-medium">{form.getValues().email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="font-medium">{form.getValues().phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Company</p>
                      <p className="font-medium">{form.getValues().company || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-4 mt-6">Project Details</h4>
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Project Type</p>
                    <p className="font-medium">
                      {PROJECT_TYPES.find(t => t.value === form.getValues().projectType)?.label || form.getValues().projectType}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Project Description</p>
                    <p className="font-medium">{form.getValues().description}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Selected Features</p>
                    <p className="font-medium">
                      {form.getValues().features?.length 
                        ? form.getValues().features.join(', ') 
                        : 'None selected'}
                    </p>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-4 mt-6">Budget & Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Estimated Budget</p>
                      <p className="font-medium">
                        {BUDGET_RANGES.find(b => b.value === form.getValues().budget)?.label || form.getValues().budget}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Expected Timeline</p>
                      <p className="font-medium">
                        {TIMELINE_OPTIONS.find(t => t.value === form.getValues().timeline)?.label || form.getValues().timeline}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Preferred Start Date</p>
                      <p className="font-medium">{form.getValues().startDate || 'Flexible'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Deadline</p>
                      <p className="font-medium">{form.getValues().deadline || 'Flexible'}</p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="termsAgreed"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <div className="flex items-start">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1 mr-3"
                          />
                        </FormControl>
                        <FormLabel className="text-gray-700">
                          I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and 
                          <a href="#" className="text-primary hover:underline"> Privacy Policy</a>.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    onClick={goToPrevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Previous
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                    disabled={onboardingMutation.isPending}
                  >
                    {onboardingMutation.isPending ? 'Submitting...' : 'Submit Request'} <i className="fas fa-check ml-2"></i>
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default ClientOnboarding;
