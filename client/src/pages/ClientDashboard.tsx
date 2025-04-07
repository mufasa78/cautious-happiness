import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, MessageSquare, FileUp, Send } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Type definitions
interface Project {
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
  createdAt: Date;
}

interface Document {
  id: number;
  projectId: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedBy: number;
  uploadedByType: string;
  description: string | null;
  createdAt: Date;
}

interface Message {
  id: number;
  projectId: number;
  senderId: number;
  senderType: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

// Form schemas
const documentSchema = z.object({
  projectId: z.number().positive(),
  fileName: z.string().min(1, "Filename is required"),
  fileType: z.string().min(1, "File type is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
});

const messageSchema = z.object({
  projectId: z.number().positive(),
  content: z.string().min(1, "Message content is required"),
});

type DocumentFormValues = z.infer<typeof documentSchema>;
type MessageFormValues = z.infer<typeof messageSchema>;

export default function ClientDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Fetch client's projects
  const {
    data: projects,
    isLoading: projectsLoading
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Fetch documents for selected project
  const {
    data: documents,
    isLoading: documentsLoading
  } = useQuery<{ success: boolean, data: Document[] }>({
    queryKey: [`/api/projects/${selectedProject}/documents`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedProject,
  });

  // Fetch messages for selected project
  const {
    data: messages,
    isLoading: messagesLoading
  } = useQuery<{ success: boolean, data: Message[] }>({
    queryKey: [`/api/projects/${selectedProject}/messages`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedProject,
  });

  // Document upload form
  const documentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      projectId: selectedProject || 0,
      fileName: "",
      fileType: "",
      fileUrl: "",
      description: "",
    },
  });

  // Message form
  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      projectId: selectedProject || 0,
      content: "",
    },
  });

  // Update form values when selected project changes
  useEffect(() => {
    if (selectedProject) {
      documentForm.setValue("projectId", selectedProject);
      messageForm.setValue("projectId", selectedProject);
    }
  }, [selectedProject, documentForm, messageForm]);

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      });
      documentForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/documents`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      messageForm.reset({
        projectId: selectedProject || 0,
        content: "",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/messages`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Message failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to get status badge color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "in progress":
        return "bg-blue-200 text-blue-800";
      case "completed":
        return "bg-green-200 text-green-800";
      case "on hold":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString() + " " + 
           new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle document submission
  const onDocumentSubmit = (data: DocumentFormValues) => {
    uploadDocumentMutation.mutate(data);
  };

  // Handle message submission
  const onMessageSubmit = (data: MessageFormValues) => {
    sendMessageMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.username}! Manage your projects, share documents, and communicate with the team.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            Return to Home
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projects List Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                Select a project to view details and interact with it
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-3 border rounded-md cursor-pointer transition-all hover:bg-accent ${
                        selectedProject === project.id ? 'bg-accent border-primary' : ''
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{project.projectType}</h3>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {project.description}
                          </p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Details and Interaction Area */}
        <div className="md:col-span-2">
          {selectedProject ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {projects?.find(p => p.id === selectedProject)?.projectType}
                </CardTitle>
                <CardDescription>
                  Project ID: {selectedProject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="w-full">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="documents">
                      Documents <FileText className="ml-1 h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="messages">
                      Messages <MessageSquare className="ml-1 h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>

                  {/* Project Details Tab */}
                  <TabsContent value="details" className="mt-4">
                    {projectsLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      projects?.filter(p => p.id === selectedProject).map(project => (
                        <div key={project.id} className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Project Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-md">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p>{project.projectType}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge className={getStatusColor(project.status)}>
                                  {project.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                                <p>{project.timeline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                                <p>{project.budget}</p>
                              </div>
                              {project.deadline && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                                  <p>{project.deadline}</p>
                                </div>
                              )}
                              {project.startDate && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                  <p>{project.startDate}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Description</h3>
                            <p className="bg-muted p-4 rounded-md">{project.description}</p>
                          </div>
                          
                          {project.features && project.features.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium mb-2">Features</h3>
                              <ul className="list-disc pl-5 space-y-1 bg-muted p-4 rounded-md">
                                {project.features.map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {project.additionalRequirements && (
                            <div>
                              <h3 className="text-lg font-medium mb-2">Additional Requirements</h3>
                              <p className="bg-muted p-4 rounded-md">{project.additionalRequirements}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-4 space-y-4">
                    <div className="bg-muted p-4 rounded-md space-y-4">
                      <h3 className="text-lg font-medium">Upload New Document</h3>
                      <Form {...documentForm}>
                        <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
                          <FormField
                            control={documentForm.control}
                            name="fileName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Document Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Project Wireframes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={documentForm.control}
                              name="fileType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>File Type</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. PDF, DOCX, JPG" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={documentForm.control}
                              name="fileUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>File URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={documentForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Add any relevant details about this document"
                                    className="min-h-[80px]"
                                    {...field} 
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={uploadDocumentMutation.isPending}
                          >
                            {uploadDocumentMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <FileUp className="mr-2 h-4 w-4" />
                                Upload Document
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Project Documents</h3>
                      {documentsLoading ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : !documents?.data || documents.data.length === 0 ? (
                        <div className="text-center p-4 bg-muted rounded-md">
                          <p className="text-muted-foreground">No documents uploaded yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {documents.data.map((doc) => (
                            <div key={doc.id} className="p-3 border rounded-md">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <h4 className="font-medium">{doc.fileName}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{doc.fileType}</p>
                                  {doc.description && (
                                    <p className="text-sm mt-1">{doc.description}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Uploaded by {doc.uploadedByType} on {formatDate(doc.createdAt)}
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild
                                >
                                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Messages Tab */}
                  <TabsContent value="messages" className="mt-4 space-y-4">
                    <div className="bg-muted p-4 rounded-md space-y-4">
                      <h3 className="text-lg font-medium">Send a Message</h3>
                      <Form {...messageForm}>
                        <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-4">
                          <FormField
                            control={messageForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Type your message here..."
                                    className="min-h-[120px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={sendMessageMutation.isPending}
                          >
                            {sendMessageMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Conversation</h3>
                      {messagesLoading ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : !messages?.data || messages.data.length === 0 ? (
                        <div className="text-center p-4 bg-muted rounded-md">
                          <p className="text-muted-foreground">No messages yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.data.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`p-3 rounded-md ${
                                msg.senderType === 'client' 
                                  ? 'bg-primary/10 ml-8' 
                                  : 'bg-muted mr-8'
                              }`}
                            >
                              <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-sm font-medium">
                                    {msg.senderType === 'client' ? 'You' : 'Admin'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(msg.createdAt)}
                                  </p>
                                </div>
                                <p>{msg.content}</p>
                                {msg.senderType !== 'client' && (
                                  <div className="flex items-center mt-1 self-end">
                                    <Badge variant="outline" className="text-xs">
                                      {msg.isRead ? 'Read' : 'Unread'}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Select a Project</h3>
                  <p className="text-muted-foreground">
                    Choose a project from the list to view details and interact with it
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}