"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Asset {
  id: string;
  type: "image" | "audio" | "video";
  url: string;
  modelUsed: string;
  isLocked: boolean;
  createdAt: string;
}

export default function AssetGallery() {
  const params = useParams();
  const projectId = params.id as string;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "image" | "audio" | "video"
  >("all");

  useEffect(() => {
    if (projectId) {
      fetchAssets();
    }
  }, [projectId]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stage4/assets/${projectId}`);
      const data = await response.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    setGeneratingImages(true);
    try {
      const response = await fetch("/api/stage4/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, useSeeds: true }),
      });

      const data = await response.json();
      if (data.success) {
        fetchAssets();
        alert("Images generated successfully");
      } else {
        alert("Failed to generate images: " + data.error);
      }
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Error generating images");
    } finally {
      setGeneratingImages(false);
    }
  };

  const handleLockAsset = async (assetId: string) => {
    try {
      const response = await fetch("/api/stage4/lock-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });

      if (response.ok) {
        fetchAssets();
        alert("Asset locked");
      }
    } catch (error) {
      console.error("Error locking asset:", error);
    }
  };

  const handleUnlockAsset = async (assetId: string) => {
    try {
      const response = await fetch("/api/stage4/unlock-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });

      if (response.ok) {
        fetchAssets();
        alert("Asset unlocked");
      }
    } catch (error) {
      console.error("Error unlocking asset:", error);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      const response = await fetch(`/api/stage4/asset/${assetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAssets();
        alert("Asset deleted");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const filteredAssets =
    filterType === "all"
      ? assets
      : assets.filter((asset) => asset.type === filterType);

  if (loading && assets.length === 0) {
    return <div className="p-8 text-center">Loading assets...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Stage 4: Image Gallery</h2>
        <button
          onClick={handleGenerateImages}
          disabled={generatingImages}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generatingImages ? "Generating Images..." : "Generate Images"}
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {(["all", "image", "audio", "video"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filterType !== "all" ? filterType + "s" : "assets"} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="border rounded-lg overflow-hidden bg-white shadow-md"
            >
              {/* Asset Preview */}
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                {asset.type === "image" ? (
                  <img
                    src={asset.url}
                    alt="Asset"
                    className="w-full h-full object-cover"
                  />
                ) : asset.type === "audio" ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔊</div>
                    <p className="text-sm text-gray-600">Audio</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-sm text-gray-600">Video</p>
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-xs text-gray-500">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                  </div>
                  <div className="text-xs text-gray-600">{asset.modelUsed}</div>
                </div>

                {/* Lock Status */}
                {asset.isLocked && (
                  <div className="mb-3 text-xs bg-yellow-100 text-yellow-800 p-2 rounded">
                    🔒 Locked
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {asset.isLocked ? (
                    <button
                      onClick={() => handleUnlockAsset(asset.id)}
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Unlock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLockAsset(asset.id)}
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Lock
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="px-3 py-1 text-xs bg-red-200 text-red-800 rounded hover:bg-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
