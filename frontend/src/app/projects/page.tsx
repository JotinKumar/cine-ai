"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Film, Plus, Trash2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useProjectStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const setProjectId = useProjectStore((s) => s.setProjectId);

  // Mock user ID (in real app, get from auth)
  const userId = "user-123";

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUserProjects(userId);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setIsCreating(true);
      const response = await apiClient.createProject(userId, newProjectName);
      if (response.data.success) {
        const newProject = response.data.project;
        setProjects([newProject, ...projects]);
        setNewProjectName("");
        // Navigate to blueprint form
        setProjectId(newProject.id);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await apiClient.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      draft: { label: "Draft", variant: "secondary" },
      stage1_complete: { label: "Story Created", variant: "default" },
      stage2_complete: { label: "Story Edited", variant: "default" },
      stage3_complete: { label: "Scenes Ready", variant: "default" },
      stage4_complete: { label: "Images Generated", variant: "default" },
      completed: { label: "Completed", variant: "default" },
      error: { label: "Error", variant: "destructive" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 mesh-gradient opacity-30"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/50 animate-glow">
              <Film className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black gradient-text">My Projects</h1>
              <p className="text-gray-400 mt-2 text-lg">
                Create and manage your cinematic masterpieces
              </p>
            </div>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="glass text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
        </div>

        {/* Create New Project Form */}
        <Card className="mb-12 glass border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Plus className="w-6 h-6" />
              </div>
              Create New Project
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Start your next cinematic masterpiece
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createProject} className="flex gap-3">
              <Input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter your project name..."
                className="flex-1 glass border-white/20 text-white placeholder:text-gray-500 text-lg py-6"
              />
              <Button
                type="submit"
                disabled={isCreating || !newProjectName.trim()}
                size="lg"
                className="px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 transition-all shadow-lg hover:shadow-purple-500/50 font-bold border-0"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Projects List */}
        {isLoading ? (
          <Card className="py-20 glass border-white/10">
            <CardContent className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mb-6"></div>
              <p className="text-white font-semibold text-lg">
                Loading your projects...
              </p>
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card className="border-2 border-dashed border-white/10 glass">
            <CardContent className="py-20 text-center">
              <Film className="w-20 h-20 mx-auto text-purple-500 mb-6" />
              <p className="text-white text-2xl font-bold mb-3">
                No projects yet
              </p>
              <p className="text-gray-400 text-lg">
                Create your first project above to start making cinematic magic!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const statusBadge = getStatusBadge(project.status);
              return (
                <Card
                  key={project.id}
                  className="glass border-white/10 hover:border-purple-500/50 group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl text-white group-hover:gradient-text transition-colors line-clamp-2 font-bold">
                        {project.name}
                      </CardTitle>
                      <Badge
                        variant={statusBadge.variant}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                      >
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={() => setProjectId(project.id)}
                        className="flex-1"
                      >
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all border-0 shadow-lg hover:shadow-purple-500/50"
                          size="lg"
                        >
                          <Film className="w-4 h-4 mr-2" />
                          Open Project
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => deleteProject(project.id)}
                        className="glass border-red-500/50 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
