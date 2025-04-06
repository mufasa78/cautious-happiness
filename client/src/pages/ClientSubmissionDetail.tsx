import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ClientWithProjects {
  client: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    company: string | null;
    address: string | null;
    createdAt: string;
  };
  projects: {
    id: number;
    clientId: number;
    projectType: string;
    description: string;
    features: string[];
    budget: string;
    timeline: string;
    startDate: string | null;
    deadline: string | null;
    additionalRequirements: string | null;
    status: string;
    createdAt: string;
  }[];
}

const CLIENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const ClientSubmissionDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const clientId = parseInt(params.id);
  
  const { data, isLoading, error } = useQuery<ClientWithProjects>({
    queryKey: [`/api/admin/clients/${clientId}`]
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: number, status: string }) => 
      apiRequest('PATCH', `/api/admin/projects/${projectId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/clients/${clientId}`] });
      toast({
        title: "Status updated",
        description: "Project status has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (projectId: number, status: string) => {
    updateStatusMutation.mutate({ projectId, status });
  };

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Client Details</h1>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout hideFooter>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Client Details</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error loading client details. Please try again later.</p>
              <Button 
                onClick={() => setLocation('/admin')}
                className="mt-4"
              >
                Back to Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { client, projects } = data;

  return (
    <Layout hideFooter>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Client Details</h1>
          <Button onClick={() => setLocation('/admin')} variant="outline">
            Back to Admin
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500">Full Name</h3>
                  <p className="font-medium">{client.fullName}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Email</h3>
                  <p className="font-medium">{client.email}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500">Phone</h3>
                  <p className="font-medium">{client.phone}</p>
                </div>
                {client.company && (
                  <div>
                    <h3 className="text-sm text-gray-500">Company</h3>
                    <p className="font-medium">{client.company}</p>
                  </div>
                )}
                {client.address && (
                  <div>
                    <h3 className="text-sm text-gray-500">Address</h3>
                    <p className="font-medium">{client.address}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm text-gray-500">Submitted On</h3>
                  <p className="font-medium">{format(new Date(client.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.map((project) => (
                <div key={project.id} className="mb-8 pb-8 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{project.projectType}</h2>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Status:</span>
                      <Select 
                        defaultValue={project.status}
                        onValueChange={(value) => handleStatusChange(project.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLIENT_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Budget</h3>
                      <p className="font-medium">{project.budget}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Timeline</h3>
                      <p className="font-medium">{project.timeline}</p>
                    </div>
                    {project.startDate && (
                      <div>
                        <h3 className="text-sm text-gray-500 mb-1">Preferred Start Date</h3>
                        <p className="font-medium">{project.startDate}</p>
                      </div>
                    )}
                    {project.deadline && (
                      <div>
                        <h3 className="text-sm text-gray-500 mb-1">Deadline</h3>
                        <p className="font-medium">{project.deadline}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm text-gray-500 mb-1">Description</h3>
                    <p>{project.description}</p>
                  </div>
                  
                  {project.features && project.features.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm text-gray-500 mb-1">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.features.map((feature, idx) => (
                          <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.additionalRequirements && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Additional Requirements</h3>
                      <p>{project.additionalRequirements}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between space-x-4">
          <Button onClick={() => setLocation('/admin')} variant="outline">
            Back to Admin
          </Button>
          <div>
            <Button className="mr-2" variant="outline">
              <i className="fas fa-envelope mr-2"></i> Email Client
            </Button>
            <Button>
              <i className="fas fa-file-export mr-2"></i> Export as PDF
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientSubmissionDetail;
