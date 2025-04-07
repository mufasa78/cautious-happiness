import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import ClientAccountForm from '@/components/ClientAccountForm';
import type { Client, Project, Contact } from '@shared/schema';

const AdminPage: React.FC = () => {
  const { 
    data: clients, 
    isLoading: isLoadingClients,
    error: clientsError
  } = useQuery<Client[]>({
    queryKey: ['/api/admin/clients']
  });

  const { 
    data: projects, 
    isLoading: isLoadingProjects,
    error: projectsError
  } = useQuery<Project[]>({
    queryKey: ['/api/admin/projects']
  });

  const { 
    data: contacts, 
    isLoading: isLoadingContacts,
    error: contactsError
  } = useQuery<Contact[]>({
    queryKey: ['/api/admin/contacts']
  });

  const isLoading = isLoadingClients || isLoadingProjects || isLoadingContacts;
  const hasError = clientsError || projectsError || contactsError;

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout hideFooter>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error loading data. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="clients">
          <TabsList className="mb-6">
            <TabsTrigger value="clients">Client Submissions</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
            <TabsTrigger value="accounts">Client Accounts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {clients && clients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.fullName}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone}</TableCell>
                          <TableCell>{client.company || 'N/A'}</TableCell>
                          <TableCell>{format(new Date(client.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Link href={`/admin/clients/${client.id}`}>
                              <Button size="sm" variant="outline">View Details</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No client submissions yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {projects && projects.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Type</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.projectType}</TableCell>
                          <TableCell>{project.budget}</TableCell>
                          <TableCell>{project.timeline}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Link href={`/admin/clients/${project.clientId}`}>
                              <Button size="sm" variant="outline">View Client</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No projects yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {contacts && contacts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.subject}</TableCell>
                          <TableCell>{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => alert(contact.message)}>
                              View Message
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No contact messages yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accounts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ClientAccountForm clients={clients || []} />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Client Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {clients && clients.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Account Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.fullName}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>
                              {client.userId ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Has Account
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  No Account
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>No clients available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
