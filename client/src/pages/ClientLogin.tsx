import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CodeIcon } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Set up form with validation
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null);
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        // Check if the user is a client type, if not show error
        if (response.user.userType !== 'client') {
          setLoginError("This portal is only for client accounts. Please use the admin login if you're an administrator.");
          return;
        }
        setLocation("/client/dashboard");
      },
      onError: (error) => {
        setLoginError(error.message || "Invalid username or password");
      },
    });
  };

  // If user is already logged in and is a client
  if (user && user.userType === 'client') {
    setLocation("/client/dashboard");
    return null;
  }
  
  // If user is logged in but is admin
  if (user && user.userType === 'admin') {
    setLocation("/admin");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <CodeIcon size={48} className="text-primary" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Client Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Track your projects, communicate with the team, and share documents
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your client dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                
                {loginError && (
                  <div className="text-sm font-medium text-red-500 mt-2">
                    {loginError}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login to Client Portal"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground text-center">
              <p>Need help? Contact us at <span className="font-medium">stannjoro@hotmail.com</span></p>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Button variant="link" onClick={() => setLocation("/")}>
            Return to Portfolio Website
          </Button>
        </div>
      </div>
    </div>
  );
}