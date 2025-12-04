"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  StoryBlueprintForm,
  SceneEditor,
  AssetGallery,
  VideoRenderer,
} from "@/components";
import { apiClient } from "@/lib/api-client";
import { useProjectStore } from "@/store";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(1);
  const [story, setStory] = useState<any>(null);
  const setProjectIdStore = useProjectStore((s) => s.setProjectId);

  useEffect(() => {
    if (projectId) {
      setProjectIdStore(projectId);
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProject(projectId);
      setProject(response.data.project);
      if (response.data.project.story) {
        setStory(response.data.project.story);
        setCurrentStage(2);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryGenerated = (generatedStory: any) => {
    setStory(generatedStory);
    setCurrentStage(2);
  };

  const handleError = (error: string) => {
    alert(`Error: ${error}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Project not found
          </h1>
          <a
            href="/projects"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/projects"
            className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block"
          >
            ← Back to Projects
          </a>
          <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-2">
            Status:{" "}
            <span className="font-semibold capitalize">
              {project.status.replace(/_/g, " ")}
            </span>
          </p>
        </div>

        {/* Stage Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((stage) => (
              <div key={stage} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                    stage <= currentStage
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stage}
                </div>
                <span className="text-xs text-gray-600 text-center">
                  {["Story", "Edit", "Scenes", "Images", "Video"][stage - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStage === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                📝 Stage 1: Story Generation
              </h2>
              <p className="text-gray-600 mb-6">
                Fill in your story blueprint and our AI will generate a complete
                cinematic story based on your specifications.
              </p>
              <StoryBlueprintForm
                onSuccess={handleStoryGenerated}
                onError={handleError}
              />
            </div>
          )}

          {currentStage >= 2 && story && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📖 Generated Story</h2>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Word Count:</strong> {story.wordCountActual} words
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Constraints:</strong> {story.constraintsConfirmation}
                </p>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold mb-4">Story Text</h4>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {story.storyText}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold mb-4">
                  Scenes ({story.scenes.length})
                </h4>
                <div className="space-y-4">
                  {story.scenes.map((scene: string, idx: number) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Scene {idx + 1}
                      </h5>
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {scene}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStage(1)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setCurrentStage(3)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Continue to Scene Generation →
                </button>
              </div>
            </div>
          )}

          {currentStage >= 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                🎨 Stage 3: Scene Generation
              </h2>
              <SceneEditor />
            </div>
          )}

          {currentStage >= 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                🖼️ Stage 4: Image Generation
              </h2>
              <AssetGallery />
            </div>
          )}

          {currentStage >= 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                🎬 Stage 5: Video Assembly
              </h2>
              <VideoRenderer />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
