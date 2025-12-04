"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProjectStore, useBlueprintStore } from "@/store";
import { apiClient } from "@/lib/api-client";

const BlueprintSchema = z.object({
  coreIdea: z.string().min(10, "Core idea must be at least 10 characters"),
  genre: z.string().min(1, "Genre is required"),
  toneMood: z.string().min(1, "Tone & Mood is required"),
  wordCount: z.number().int().min(500).max(10000),
  languageStyle: z.string().default("English, cinematic"),
  narration: z.enum(["first-person", "third-person", "second-person"]),
  sceneCount: z.number().int().min(1).max(20),
  characters: z.array(z.string()).min(1).max(10),
  customPrompt: z.string().optional(),
  selectedModel: z.string().default("anthropic/claude-3.5-sonnet"),
});

type BlueprintFormData = z.infer<typeof BlueprintSchema>;

interface StoryBlueprintFormProps {
  onSuccess?: (story: any) => void;
  onError?: (error: string) => void;
}

export function StoryBlueprintForm({
  onSuccess,
  onError,
}: StoryBlueprintFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [characterInput, setCharacterInput] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const projectId = useProjectStore((s) => s.projectId);
  const setBlueprintData = useBlueprintStore((s) => s.setBlueprintData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BlueprintFormData>({
    resolver: zodResolver(BlueprintSchema),
    defaultValues: {
      languageStyle: "English, cinematic",
      selectedModel: "anthropic/claude-3.5-sonnet",
      sceneCount: 5,
      wordCount: 1500,
    },
  });

  const wordCount = watch("wordCount");

  const addCharacter = () => {
    if (characterInput.trim() && characters.length < 10) {
      setCharacters([...characters, characterInput.trim()]);
      setCharacterInput("");
    }
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BlueprintFormData) => {
    try {
      if (characters.length === 0) {
        onError?.("Add at least one character");
        return;
      }

      if (!projectId) {
        onError?.("Project not found");
        return;
      }

      setIsLoading(true);

      const blueprintData = {
        ...data,
        characters,
        projectId,
      };

      setBlueprintData(blueprintData);

      // Get API key from localStorage or environment
      const apiKey = localStorage.getItem("openrouter_api_key") || "";

      const response = await apiClient.generateStory(
        projectId,
        blueprintData,
        apiKey
      );

      if (response.data.success) {
        onSuccess?.(response.data.story);
      } else {
        onError?.(response.data.message || "Failed to generate story");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Core Idea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Core Idea / Plot
        </label>
        <textarea
          {...register("coreIdea")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe the central plot of your story..."
        />
        {errors.coreIdea && (
          <p className="text-red-500 text-sm mt-1">{errors.coreIdea.message}</p>
        )}
      </div>

      {/* Genre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Genre
        </label>
        <select
          {...register("genre")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select a genre</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Horror">Horror</option>
          <option value="Drama">Drama</option>
          <option value="Thriller">Thriller</option>
          <option value="Romance">Romance</option>
          <option value="Comedy">Comedy</option>
          <option value="Mystery">Mystery</option>
        </select>
        {errors.genre && (
          <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
        )}
      </div>

      {/* Tone & Mood */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tone & Mood
        </label>
        <select
          {...register("toneMood")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select tone</option>
          <option value="Light-hearted">Light-hearted</option>
          <option value="Suspenseful">Suspenseful</option>
          <option value="Dramatic">Dramatic</option>
          <option value="Horror / Dread">Horror / Dread</option>
          <option value="Epic">Epic</option>
          <option value="Melancholic">Melancholic</option>
        </select>
        {errors.toneMood && (
          <p className="text-red-500 text-sm mt-1">{errors.toneMood.message}</p>
        )}
      </div>

      {/* Word Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Word Count: {wordCount}
        </label>
        <input
          type="range"
          {...register("wordCount", { valueAsNumber: true })}
          min={500}
          max={10000}
          step={100}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tolerance: {Math.floor(wordCount * 0.97)} -{" "}
          {Math.ceil(wordCount * 1.03)} words
        </p>
      </div>

      {/* Language & Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language & Style
        </label>
        <input
          type="text"
          {...register("languageStyle")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., English, cinematic"
        />
      </div>

      {/* Narration Perspective */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Narration Perspective
        </label>
        <select
          {...register("narration")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select perspective</option>
          <option value="first-person">First Person</option>
          <option value="third-person">Third Person</option>
          <option value="second-person">Second Person</option>
        </select>
        {errors.narration && (
          <p className="text-red-500 text-sm mt-1">
            {errors.narration.message}
          </p>
        )}
      </div>

      {/* Scene Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scene Count
        </label>
        <input
          type="number"
          {...register("sceneCount", { valueAsNumber: true })}
          min={1}
          max={20}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.sceneCount && (
          <p className="text-red-500 text-sm mt-1">
            {errors.sceneCount.message}
          </p>
        )}
      </div>

      {/* Characters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Characters
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={characterInput}
            onChange={(e) => setCharacterInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCharacter()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add a character name..."
          />
          <button
            type="button"
            onClick={addCharacter}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {characters.map((char, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-100 p-2 rounded"
            >
              <span>{char}</span>
              <button
                type="button"
                onClick={() => removeCharacter(idx)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {characters.length === 0 && (
          <p className="text-red-500 text-sm mt-1">
            Add at least one character
          </p>
        )}
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <select
          {...register("selectedModel")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
          <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
          <option value="openai/gpt-4">GPT-4</option>
          <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
          <option value="google/gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
        </select>
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Instructions (Optional)
        </label>
        <textarea
          {...register("customPrompt")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Add any additional instructions for the story generation..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary-600 hover:bg-primary-700"
        }`}
      >
        {isLoading ? "Generating Story..." : "Generate Story"}
      </button>
    </form>
  );
}
