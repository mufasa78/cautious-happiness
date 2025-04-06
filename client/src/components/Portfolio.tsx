import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaStar, FaCodeBranch, FaGithub } from 'react-icons/fa';
import { BiCode } from 'react-icons/bi';
import { getQueryFn } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PortfolioProps {
  onScrollToSection: (sectionId: string) => void;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  topics: string[];
  homepage: string | null;
}

const LanguageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-blue-600',
  Java: 'bg-red-600',
  'C#': 'bg-green-600',
  PHP: 'bg-purple-600',
  Go: 'bg-blue-400',
  Ruby: 'bg-red-500',
  Rust: 'bg-orange-600',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-500',
  HTML: 'bg-orange-600',
  CSS: 'bg-blue-500',
  Shell: 'bg-gray-600',
  default: 'bg-gray-500',
};

function getLanguageColor(language: string | null): string {
  if (!language) return LanguageColors.default;
  return LanguageColors[language] || LanguageColors.default;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const Portfolio: React.FC<PortfolioProps> = ({ onScrollToSection }) => {
  // State for filtering repos
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  
  // Fetch GitHub repositories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/github/repos'],
    queryFn: getQueryFn<{ success: boolean; data: GithubRepo[] }>({ on401: 'returnNull' }),
  });

  // Get all unique languages to create filter buttons
  const languages = data?.data
    ? Array.from(
        new Set(
          data.data
            .map((repo) => repo.language)
            .filter((lang): lang is string => Boolean(lang))
        )
      )
    : [];

  // Filter repositories based on selected language
  const filteredRepos = data?.data
    ? activeFilter
      ? data.data.filter((repo) => repo.language === activeFilter)
      : data.data
    : [];

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">My GitHub Projects</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through my latest GitHub repositories and see what I've been working on.
          </p>
        </div>

        {/* Language filters */}
        {languages.length > 0 && (
          <div className="flex mb-8 justify-center">
            <div className="flex flex-wrap gap-2 justify-center bg-white rounded-lg p-2 shadow w-full max-w-xl mx-auto">
              <button
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md ${
                  activeFilter === null ? 'bg-primary text-white' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveFilter(null)}
              >
                All
              </button>
              {languages.map((language) => (
                <button
                  key={language}
                  className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md ${
                    activeFilter === language ? 'bg-primary text-white' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveFilter(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[350px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Skeleton className="h-9 w-full sm:w-24" />
                  <Skeleton className="h-9 w-full sm:w-40" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold text-red-500 mb-2">Could not load repositories</h3>
            <p className="text-gray-600">Please try again later or check the connection.</p>
          </div>
        )}

        {/* Repositories grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRepos.map((repo) => (
              <Card key={repo.id} className="overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2 truncate">
                    <FaGithub className="text-gray-700" />
                    <span className="truncate">{repo.name}</span>
                  </CardTitle>
                  {repo.language && (
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                      <span className="text-sm text-gray-600">{repo.language}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 text-sm line-clamp-3 h-[60px]">
                    {repo.description || "No description available"}
                  </p>
                  
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {repo.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{repo.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCodeBranch className="text-gray-500" />
                      <span>{repo.forks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">Updated: {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setSelectedRepo(repo)}
                      >
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      {selectedRepo && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                              <FaGithub className="flex-shrink-0 text-gray-700" />
                              <span className="truncate">{selectedRepo.name}</span>
                            </DialogTitle>
                            <DialogDescription>
                              {selectedRepo.description || "No description available"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {selectedRepo.language && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Main Language:</span>
                                <div className="flex items-center gap-2">
                                  <span className={`h-3 w-3 rounded-full ${getLanguageColor(selectedRepo.language)}`}></span>
                                  <span>{selectedRepo.language}</span>
                                </div>
                              </div>
                            )}
                            
                            {selectedRepo.topics && selectedRepo.topics.length > 0 && (
                              <div>
                                <span className="font-semibold block mb-2">Topics:</span>
                                <div className="flex flex-wrap gap-2">
                                  {selectedRepo.topics.map((topic) => (
                                    <Badge key={topic} variant="secondary">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="font-semibold block">Created:</span>
                                <span>{formatDate(selectedRepo.created_at)}</span>
                              </div>
                              <div>
                                <span className="font-semibold block">Last Updated:</span>
                                <span>{formatDate(selectedRepo.updated_at)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaStar className="flex-shrink-0 text-yellow-500" />
                                <span>{selectedRepo.stars} stars</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaCodeBranch className="flex-shrink-0 text-gray-500" />
                                <span>{selectedRepo.forks} forks</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
                            {selectedRepo.homepage && (
                              <a 
                                href={selectedRepo.homepage} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                              >
                                <Button variant="outline" className="w-full">
                                  <BiCode className="mr-2 flex-shrink-0" />
                                  View Demo
                                </Button>
                              </a>
                            )}
                            <a 
                              href={selectedRepo.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto"
                            >
                              <Button className="w-full">
                                <FaGithub className="mr-2 flex-shrink-0" />
                                View on GitHub
                              </Button>
                            </a>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full">
                      View Repository
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <button 
            onClick={() => onScrollToSection('hire')}
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
