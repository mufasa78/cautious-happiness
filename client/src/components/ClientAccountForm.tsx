import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Client } from '@shared/schema';

// Form validation schema
const clientAccountSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  clientId: z.string().min(1, 'Please select a client'),
});

type ClientAccountFormValues = z.infer<typeof clientAccountSchema>;

interface ClientAccountFormProps {
  clients: Client[];
}

const ClientAccountForm: React.FC<ClientAccountFormProps> = ({ clients }) => {
  const { toast } = useToast();
  
  // Set up form with validation
  const form = useForm<ClientAccountFormValues>({
    resolver: zodResolver(clientAccountSchema),
    defaultValues: {
      username: '',
      password: '',
      clientId: '',
    },
  });
  
  // Set up mutation for client account creation
  const createClientAccountMutation = useMutation({
    mutationFn: async (data: ClientAccountFormValues) => {
      const res = await apiRequest('POST', '/api/register-client', {
        username: data.username,
        password: data.password,
        userType: 'client',
        clientId: parseInt(data.clientId),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Client account created successfully',
      });
      form.reset();
      
      // Invalidate queries to refresh the client list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client account',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: ClientAccountFormValues) => {
    createClientAccountMutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Client Account</CardTitle>
        <CardDescription>
          Create login credentials for existing clients
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
                    <Input placeholder="Enter username" {...field} />
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
                    <Input 
                      type="password" 
                      placeholder="Enter password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Client</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients
                        .filter(client => !client.userId) // Filter out clients that already have user accounts
                        .map(client => (
                          <SelectItem 
                            key={client.id} 
                            value={client.id.toString()}
                          >
                            {client.fullName} ({client.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={createClientAccountMutation.isPending}
            >
              {createClientAccountMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Client Account'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClientAccountForm;