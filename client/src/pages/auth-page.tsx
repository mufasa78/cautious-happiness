import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldAlert } from "lucide-react";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AuthPage = () => {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex h-screen">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-5">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Admin Access
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to access your administrator dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-amber-500" />
            </div>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 mb-6 text-sm">
              This area is restricted to authorized administrators only.
              Public registration has been disabled for security.
            </div>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section */}
      <div 
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary/70 flex-col justify-center items-center p-10 text-white"
      >
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">Portfolio & Project Management</h1>
          <p className="text-xl mb-8">
            Access your admin dashboard to manage client projects, view inquiries, and update portfolio items.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="font-semibold text-lg mb-2">Client Management</h3>
              <p className="text-sm">View and manage all client submissions and project details</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="font-semibold text-lg mb-2">Project Tracking</h3>
              <p className="text-sm">Update project statuses and track progress</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="font-semibold text-lg mb-2">Portfolio Updates</h3>
              <p className="text-sm">Manage your portfolio projects and case studies</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <h3 className="font-semibold text-lg mb-2">Message Center</h3>
              <p className="text-sm">View and respond to all contact form submissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
