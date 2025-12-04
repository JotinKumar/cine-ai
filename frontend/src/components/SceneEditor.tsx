"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Scene {
  id: string;
  sceneIndex: number;
  originalScene: string;
  shotType: string;
  angle: string;
  view: string;
  staging: string;
  sceneFunction: string;
}

export default function SceneEditor() {
  const params = useParams();
  const projectId = params.id as string;
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingScenes, setGeneratingScenes] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchScenes();
    }
  }, [projectId]);

  const fetchScenes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stage3/scenes/${projectId}`);
      const data = await response.json();
      if (data.scenes) {
        setScenes(data.scenes);
        if (data.scenes.length > 0) {
          setSelectedScene(data.scenes[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch scenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScenes = async () => {
    setGeneratingScenes(true);
    try {
      const response = await fetch("/api/stage3/scene-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();
      if (data.success) {
        fetchScenes();
      } else {
        alert("Failed to generate scenes: " + data.error);
      }
    } catch (error) {
      console.error("Error generating scenes:", error);
      alert("Error generating scenes");
    } finally {
      setGeneratingScenes(false);
    }
  };

  const handleRegenerateScene = async () => {
    if (!selectedScene) return;

    try {
      const response = await fetch("/api/stage3/regenerate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sceneIndex: selectedScene.sceneIndex,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedScene(data.scene);
        alert("Scene regenerated successfully");
      } else {
        alert("Failed to regenerate scene: " + data.error);
      }
    } catch (error) {
      console.error("Error regenerating scene:", error);
      alert("Error regenerating scene");
    }
  };

  const handleLockScene = async (sceneIndex: number) => {
    try {
      const response = await fetch("/api/stage3/lock-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, sceneIndex }),
      });

      if (response.ok) {
        alert("Scene locked");
      }
    } catch (error) {
      console.error("Error locking scene:", error);
    }
  };

  if (loading && scenes.length === 0) {
    return <div className="p-8 text-center">Loading scenes...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Stage 3: Scene Generation</h2>
        <button
          onClick={handleGenerateScenes}
          disabled={generatingScenes}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generatingScenes ? "Generating Scenes..." : "Generate Scenes"}
        </button>
      </div>

      {scenes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No scenes yet. Click "Generate Scenes" to start.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8">
          {/* Scene List */}
          <div className="col-span-1 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold mb-4">Scenes ({scenes.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedScene?.id === scene.id
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className="font-semibold">
                    Scene {scene.sceneIndex + 1}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {scene.shotType}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scene Details */}
          {selectedScene && (
            <div className="col-span-2 border rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">
                  Scene {selectedScene.sceneIndex + 1}
                </h3>
                <p className="text-gray-700 mb-4">
                  {selectedScene.originalScene}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Shot Type
                  </label>
                  <p className="mt-1 text-lg">
                    {selectedScene.shotType || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    View
                  </label>
                  <p className="mt-1 text-lg">
                    {selectedScene.view || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Angle
                  </label>
                  <p className="mt-1 text-lg">
                    {selectedScene.angle || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Function
                  </label>
                  <p className="mt-1 text-lg">
                    {selectedScene.sceneFunction || "Not set"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Staging
                </label>
                <p className="text-gray-700 p-3 bg-gray-50 rounded">
                  {selectedScene.staging || "Not set"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRegenerateScene}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => handleLockScene(selectedScene.sceneIndex)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Lock Scene
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
