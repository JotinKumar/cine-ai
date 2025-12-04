"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface VideoJob {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage?: string;
}

export default function VideoRenderer() {
  const params = useParams();
  const projectId = params.id as string;
  const [videoJob, setVideoJob] = useState<VideoJob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [narrationStyle, setNarrationStyle] = useState("neutral");
  const [generating, setGenerating] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (projectId) {
      checkVideoStatus();
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [projectId]);

  const checkVideoStatus = async () => {
    try {
      const response = await fetch(`/api/stage5/video-status/${projectId}`);
      const data = await response.json();
      setVideoJob(data);

      if (data.status === "completed" && data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
    } catch (error) {
      console.error("Failed to check video status:", error);
    }
  };

  const handleGenerateVideo = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/stage5/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, withAudio: true }),
      });

      const data = await response.json();
      if (data.success) {
        setVideoUrl(data.videoUrl);
        setVideoJob({
          status: "completed",
          progress: 100,
        });

        // Start polling for status
        const interval = setInterval(checkVideoStatus, 5000);
        setPollingInterval(interval);
      } else {
        alert("Failed to generate video: " + data.error);
      }
    } catch (error) {
      console.error("Error generating video:", error);
      alert("Error generating video");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      const response = await fetch("/api/stage5/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, narrationStyle }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Audio generated successfully");
      } else {
        alert("Failed to generate audio: " + data.error);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      alert("Error generating audio");
    }
  };

  const handleCancelVideo = async () => {
    try {
      const response = await fetch("/api/stage5/cancel-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        setVideoJob(null);
        setVideoUrl(null);
        alert("Video generation cancelled");
      }
    } catch (error) {
      console.error("Error cancelling video:", error);
    }
  };

  const handleExportVideo = async () => {
    try {
      const response = await fetch("/api/stage5/export-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, format: "mp4", quality: "1080p" }),
      });

      const data = await response.json();
      if (data.success) {
        // Trigger download
        const a = document.createElement("a");
        a.href = data.downloadUrl;
        a.download = `cine-ai-project-${projectId}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting video:", error);
      alert("Error exporting video");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Stage 5: Video Assembly</h2>
        <p className="text-gray-600 mb-6">
          Render your final cinematic video with motion cues and audio
          narration.
        </p>
      </div>

      {/* Video Status */}
      {videoJob && (
        <div className="mb-8 p-6 border rounded-lg bg-blue-50">
          <h3 className="font-bold mb-4">Video Generation Status</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>Progress:</span>
              <span className="font-semibold">{videoJob.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${videoJob.progress}%` }}
              />
            </div>
          </div>

          <div className="mb-4">
            <span className="text-sm">
              Status:
              <span className="font-semibold ml-2">
                {videoJob.status === "completed" && "✅ Completed"}
                {videoJob.status === "processing" && "⏳ Processing"}
                {videoJob.status === "pending" && "⏰ Pending"}
                {videoJob.status === "failed" && "❌ Failed"}
              </span>
            </span>
          </div>

          {videoJob.errorMessage && (
            <div className="text-red-600 text-sm mb-4">
              {videoJob.errorMessage}
            </div>
          )}

          {videoJob.status !== "completed" && (
            <button
              onClick={handleCancelVideo}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Video Preview */}
      {videoUrl && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="font-bold mb-4">Video Preview</h3>
          <video
            controls
            src={videoUrl}
            className="w-full rounded-lg mb-4"
            style={{ maxHeight: "400px" }}
          />
          <button
            onClick={handleExportVideo}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Download Video (MP4)
          </button>
        </div>
      )}

      {/* Generate Video Section */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h3 className="font-bold mb-4">Generate Video</h3>
        <button
          onClick={handleGenerateVideo}
          disabled={generating || videoJob?.status === "processing"}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generating ? "Generating..." : "Generate Full Video"}
        </button>
      </div>

      {/* Audio Narration Section */}
      <div className="p-6 border rounded-lg bg-gray-50">
        <h3 className="font-bold mb-4">Audio Narration</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Narration Style
          </label>
          <select
            value={narrationStyle}
            onChange={(e) => setNarrationStyle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="neutral">Neutral</option>
            <option value="dramatic">Dramatic</option>
            <option value="emotional">Emotional</option>
            <option value="documentary">Documentary</option>
            <option value="whimsical">Whimsical</option>
          </select>
        </div>
        <button
          onClick={handleGenerateAudio}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Generate Audio Narration
        </button>
      </div>

      {/* Workflow Guide */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold mb-2">Workflow Guide</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Ensure all scenes are finalized in Stage 3</li>
          <li>Generate and review images in Stage 4</li>
          <li>
            Generate full video with motion cues (this will create transitions)
          </li>
          <li>Optionally add audio narration in your preferred style</li>
          <li>Download and share your final video</li>
        </ol>
      </div>
    </div>
  );
}
