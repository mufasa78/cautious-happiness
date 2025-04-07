import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  FileText, 
  MessageSquare, 
  Send, 
  FileUp, 
  BarChart4,
  Image as ImageIcon,
  File,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

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
  description: z.string().optional(),
});

// Use the same schema as the server side
const messageSchema = z.object({
  projectId: z.number().positive("Project ID is required"),
  content: z.string().min(1, "Message content is required"),
});

const fileUploadSchema = z.object({
  file: z.custom<File>()
    .refine((file) => file instanceof File, {
      message: "Please upload a valid file",
    })
    .refine((file) => file instanceof File && file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB",
    }),
});

type DocumentFormValues = z.infer<typeof documentSchema>;
type MessageFormValues = z.infer<typeof messageSchema>;

// Project tasks mock data for analytics
const getProjectTasks = (status: string) => [
  { name: 'Design', completed: status === 'completed' || status === 'in progress' ? 100 : 0 },
  { name: 'Frontend', completed: status === 'completed' ? 100 : status === 'in progress' ? 70 : 0 },
  { name: 'Backend', completed: status === 'completed' ? 100 : status === 'in progress' ? 50 : 0 },
  { name: 'Testing', completed: status === 'completed' ? 100 : status === 'in progress' ? 30 : 0 },
  { name: 'Deployment', completed: status === 'completed' ? 100 : 0 },
];

// Project timeline data based on status
const getTimelineData = (project: Project) => {
  if (!project) return [];
  
  // Calculate overall progress percentage based on status
  let progressPercentage = 0;
  switch(project.status.toLowerCase()) {
    case 'pending': progressPercentage = 10; break;
    case 'in progress': progressPercentage = 60; break;
    case 'completed': progressPercentage = 100; break;
    case 'on hold': progressPercentage = 40; break;
    default: progressPercentage = 0;
  }
  
  return [
    { name: "Progress", value: progressPercentage },
    { name: "Remaining", value: 100 - progressPercentage },
  ];
};

// Colors for progress chart
const COLORS = ['#0088FE', '#ECEFF1'];

export default function ClientDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Document form
  const documentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      projectId: selectedProject || 0,
      fileName: "",
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

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "File uploaded",
        description: "Your file has been successfully uploaded.",
      });
      documentForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/documents`] });
      setFileUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setFileUploading(false);
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

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProject) return;
    
    try {
      setFileUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProject.toString());
      formData.append('fileName', documentForm.getValues('fileName') || file.name);
      formData.append('description', documentForm.getValues('description') || '');
      
      uploadFileMutation.mutate(formData);
    } catch (error) {
      console.error("File upload error:", error);
      setFileUploading(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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

  const currentProject = projects?.find(p => p.id === selectedProject);

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
                    <TabsTrigger value="analytics">
                      Analytics <BarChart4 className="ml-1 h-4 w-4" />
                    </TabsTrigger>
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

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="mt-4">
                    {projectsLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : currentProject ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Project Progress</h3>
                          <div className="bg-muted p-4 rounded-md">
                            <div className="md:grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-md font-medium mb-2">Overall Completion</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={getTimelineData(currentProject)}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {getTimelineData(currentProject).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div>
                                <h4 className="text-md font-medium mb-2">Task Breakdown</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart
                                    data={getProjectTasks(currentProject.status)}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Bar dataKey="completed" fill="#0088FE" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="text-md font-medium mb-2">Project Timeline</h4>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Project Started</span>
                                    <span>Project Completion</span>
                                  </div>
                                  <Progress value={
                                    currentProject.status === 'completed' ? 100 :
                                    currentProject.status === 'in progress' ? 60 :
                                    currentProject.status === 'on hold' ? 40 : 10
                                  } />
                                </div>
                                
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{currentProject.startDate || 'Not started'}</span>
                                  <span>{currentProject.deadline || 'No deadline set'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Project Status</h3>
                          <Alert className={
                            currentProject.status === 'completed' ? "border-green-500" :
                            currentProject.status === 'in progress' ? "border-blue-500" :
                            currentProject.status === 'on hold' ? "border-red-500" : "border-yellow-500"
                          }>
                            {currentProject.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : currentProject.status === 'on hold' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <AlertTitle>
                              {currentProject.status === 'completed' ? "Project Completed" :
                               currentProject.status === 'in progress' ? "Project In Progress" :
                               currentProject.status === 'on hold' ? "Project On Hold" : "Project Pending"}
                            </AlertTitle>
                            <AlertDescription>
                              {currentProject.status === 'completed' ? "Your project has been successfully completed." :
                               currentProject.status === 'in progress' ? "Your project is currently being worked on." :
                               currentProject.status === 'on hold' ? "Your project is temporarily on hold." : "Your project is awaiting commencement."}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-muted rounded-md">
                        <p className="text-muted-foreground">Select a project to view analytics</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-4 space-y-4">
                    <div className="bg-muted p-4 rounded-md space-y-4">
                      <h3 className="text-lg font-medium">Upload New Document</h3>
                      <Form {...documentForm}>
                        <form className="space-y-4">
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
                          
                          <FormField
                            control={documentForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Brief description of the document" 
                                    className="resize-none" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                            />
                            <Button 
                              type="button" 
                              onClick={triggerFileUpload}
                              disabled={fileUploading || !selectedProject}
                              className="w-full"
                            >
                              {fileUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <FileUp className="mr-2 h-4 w-4" />
                                  Select File to Upload
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG, PNG, GIF. Max size: 5MB.
                            </p>
                          </div>
                        </form>
                      </Form>
                    </div>

                    <h3 className="text-lg font-medium">Project Documents</h3>
                    {documentsLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !documents?.data || documents.data.length === 0 ? (
                      <div className="text-center p-4 bg-muted rounded-md">
                        <p className="text-muted-foreground">No documents have been uploaded for this project</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {documents.data.map((doc) => (
                          <div key={doc.id} className="p-3 border rounded-md hover:bg-accent transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getFileIcon(doc.fileType)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{doc.fileName}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      Uploaded on {formatDate(doc.createdAt)}
                                    </p>
                                    {doc.description && (
                                      <p className="text-sm mt-1">{doc.description}</p>
                                    )}
                                  </div>
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                      View
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Messages Tab */}
                  <TabsContent value="messages" className="mt-4 space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-4">Project Communication</h3>
                      
                      <div className="border rounded-md bg-white mb-4 overflow-hidden">
                        <div className="max-h-64 overflow-y-auto p-4 space-y-4">
                          {messagesLoading ? (
                            <div className="flex justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : !messages?.data || messages.data.length === 0 ? (
                            <div className="text-center p-4">
                              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                            </div>
                          ) : (
                            messages.data
                              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                              .map((message) => (
                                <div 
                                  key={message.id} 
                                  className={`flex ${
                                    message.senderType === 'admin' ? 'justify-start' : 'justify-end'
                                  }`}
                                >
                                  <div 
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                      message.senderType === 'admin' 
                                        ? 'bg-muted text-foreground' 
                                        : 'bg-primary text-primary-foreground'
                                    }`}
                                  >
                                    <p>{message.content}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                      {formatDate(message.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                        
                        <Separator />
                        
                        <Form {...messageForm}>
                          <form 
                            onSubmit={messageForm.handleSubmit(onMessageSubmit)} 
                            className="p-3 flex gap-2"
                          >
                            <FormField
                              control={messageForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input 
                                      placeholder="Type your message..." 
                                      {...field} 
                                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              size="sm"
                              disabled={sendMessageMutation.isPending}
                            >
                              {sendMessageMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </form>
                        </Form>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Project</CardTitle>
                <CardDescription>
                  Please select a project from the sidebar to view details and interact with it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No Project Selected</h3>
                  <p className="max-w-md mt-2">
                    Select a project from the list on the left to view its details, upload documents, and communicate with the team.
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