import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { BiLinkExternal } from 'react-icons/bi';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PortfolioProps {
  onScrollToSection: (sectionId: string) => void;
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
}

const featuredProjects: Project[] = [
  {
    id: 1,
    title: "Cena2k",
    description: "A vibrant festival website showcasing upcoming events, ticket booking system, artist profiles, and interactive schedule planner. Features real-time updates, virtual venue tours, and social media integration.",
    technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "WebSocket", "Tailwind CSS"],
    githubUrl: "https://github.com/mufasa78/cena2k",
    liveUrl: "https://cena2k.vercel.app"
  },
  {
    id: 2,
    title: "Red Mai Pub",
    description: "A professional journal publishing platform featuring manuscript submission, peer review system, and digital article management. Includes citation tracking, author dashboard, and automated publishing workflow.",
    technologies: ["React", "Next.js", "Node.js", "MongoDB", "Redis", "Stripe", "Tailwind CSS"],
    githubUrl: "https://github.com/mufasa78/redmaipub",
    liveUrl: "https://redmaipub.vercel.app"
  },
  {
    id: 3,
    title: "Exemplary Group",
    description: "A comprehensive equipment dealership website featuring inventory management, equipment specifications, financing options, and dealer locator. Includes service scheduling and parts ordering system.",
    technologies: ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL", "AWS", "Tailwind CSS"],
    githubUrl: "https://github.com/mufasa78/exemplarygroup",
    liveUrl: "https://exemplarygroup.vercel.app"
  },
  {
    id: 4,
    title: "MCTD",
    description: "A personal blog dedicated to sharing experiences and insights about living with Mixed Connective Tissue Disease. Features symptom tracking, medication diary, and community support forum.",
    technologies: ["React", "Node.js", "PostgreSQL", "ElasticSearch", "TensorFlow.js", "Docker", "Kubernetes"],
    githubUrl: "https://github.com/mufasa78/mctd",
    liveUrl: "https://mctd.vercel.app"
  },
  {
    id: 5,
    title: "Ichiban Ke",
    description: "Professional tax and financial services website offering tax planning, wealth management, and financial consulting services. Features secure document sharing and client portal integration.",
    technologies: ["React", "Next.js", "Node.js", "Socket.io", "MongoDB", "Redis", "Tailwind CSS"],
    githubUrl: "https://github.com/mufasa78/ichiban",
    liveUrl: "https://ichibanke.vercel.app"
  },
  {
    id: 6,
    title: "Myron Mullins",
    description: "Professional coaching website offering career development, leadership training, and personal growth services. Features session booking, progress tracking, and resource library.",
    technologies: ["React", "TypeScript", "Next.js", "Sanity.io", "GitHub Actions", "Cloudinary", "Tailwind CSS"],
    githubUrl: "https://github.com/mufasa78/myronmullins",
    liveUrl: "https://myronmullins.vercel.app"
  }
];

const Portfolio: React.FC<PortfolioProps> = ({ onScrollToSection }) => {
  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Here are some of my best projects that showcase my skills and experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
                <CardDescription className="mt-2">{project.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(project.githubUrl, '_blank')}
                >
                  <FaGithub className="mr-2" />
                  View Code
                </Button>
                {project.liveUrl && (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                  >
                    <BiLinkExternal className="mr-2" />
                    Live Demo
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
