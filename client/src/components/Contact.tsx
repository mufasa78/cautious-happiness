import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(2, { message: 'Subject is required' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' })
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });
  
  const contactMutation = useMutation({
    mutationFn: (values: ContactFormValues) => 
      apiRequest('POST', '/api/contact', values),
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully. I'll get back to you soon!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-10">
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="mb-8">Have a question or want to discuss a project? Feel free to reach out to me.</p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1"><i className="fas fa-map-marker-alt"></i></div>
                  <div>
                    <h3 className="font-semibold text-lg">Address</h3>
                    <p>123 Web Developer Street, Digital City</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1"><i className="fas fa-envelope"></i></div>
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <p>info@mufasa.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-2xl mt-1"><i className="fas fa-phone"></i></div>
                  <div>
                    <h3 className="font-semibold text-lg">Phone</h3>
                    <p>+1 (234) 567-8901</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h3 className="font-semibold text-lg mb-4">Follow Me</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-white text-xl hover:text-gray-200"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="text-white text-xl hover:text-gray-200"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="text-white text-xl hover:text-gray-200"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="text-white text-xl hover:text-gray-200"><i className="fab fa-linkedin-in"></i></a>
                  <a href="#" className="text-white text-xl hover:text-gray-200"><i className="fab fa-github"></i></a>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your email" 
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Subject" 
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message" 
                            rows={4} 
                            {...field} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
