import { z } from 'zod';

/**
 * Validation schemas for all stages
 */

// Stage 1: Story Generation Blueprint
export const BlueprintSchema = z.object({
  coreIdea: z.string().min(10, 'Core idea must be at least 10 characters'),
  genre: z.string().min(1, 'Genre is required'),
  toneMood: z.string().min(1, 'Tone & Mood is required'),
  wordCount: z.number().int().min(500).max(10000),
  languageStyle: z.string().default('English, cinematic'),
  narration: z.enum(['first-person', 'third-person', 'second-person']),
  sceneCount: z.number().int().min(1).max(20),
  characters: z.array(z.string()).min(1).max(10),
  customPrompt: z.string().optional(),
  selectedModel: z.string().default('anthropic/claude-3.5-sonnet')
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

// Stage 1: Story Output
export const StoryOutputSchema = z.object({
  title: z.string(),
  storyText: z.string(),
  wordCountActual: z.number(),
  constraintsConfirmation: z.string(),
  scenes: z.array(z.string())
});

export type StoryOutput = z.infer<typeof StoryOutputSchema>;

// Stage 2: Story Editing Request
export const StoryEditRequestSchema = z.object({
  scenes: z.array(z.string()),
  editRequests: z.array(z.object({
    sceneIndex: z.number(),
    editType: z.enum(['modify', 'regenerate']),
    instructions: z.string()
  })),
  blueprint: BlueprintSchema
});

export type StoryEditRequest = z.infer<typeof StoryEditRequestSchema>;

// Stage 2: Validation Output
export const ValidationOutputSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    type: z.enum(['hard', 'soft']),
    field: z.string(),
    message: z.string(),
    sceneIndex: z.number().optional()
  })),
  warnings: z.array(z.string())
});

export type ValidationOutput = z.infer<typeof ValidationOutputSchema>;

// Stage 3: Scene Generation Input
export const SceneGenerationInputSchema = z.object({
  finalizedScenes: z.array(z.string()),
  characters: z.array(z.string()),
  genre: z.string(),
  tone: z.string(),
  narration: z.string(),
  selectedModel: z.string()
});

export type SceneGenerationInput = z.infer<typeof SceneGenerationInputSchema>;

// Stage 3: Shot Blueprint
export const ShotBlueprintSchema = z.object({
  sceneIndex: z.number(),
  originalScene: z.string(),
  shotType: z.string(),
  angle: z.string(),
  view: z.string(),
  staging: z.string(),
  relationalStaging: z.string(),
  sceneFunction: z.string()
});

export type ShotBlueprint = z.infer<typeof ShotBlueprintSchema>;

// Stage 3: Character Profile
export const CharacterProfileSchema = z.object({
  name: z.string(),
  role: z.string(),
  appearance: z.object({
    eyes: z.string(),
    skin: z.string(),
    hair: z.string()
  }),
  outfit: z.object({
    upper: z.string(),
    lower: z.string(),
    footwear: z.string()
  }),
  props: z.array(z.string()),
  designPrompt: z.string(),
  snippets: z.record(z.string())
});

export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;

// Stage 3: Background Blueprint
export const BackgroundBlueprintSchema = z.object({
  locationName: z.string(),
  masterBlueprint: z.string(),
  overlays: z.object({
    lighting: z.string(),
    weather: z.string(),
    timeOfDay: z.string()
  })
});

export type BackgroundBlueprint = z.infer<typeof BackgroundBlueprintSchema>;

// Stage 4: Image Prompt Assembly Input
export const ImagePromptInputSchema = z.object({
  sceneBreakdown: ShotBlueprintSchema,
  characterSnippet: z.string(),
  backgroundBlueprint: BackgroundBlueprintSchema,
  userImageStyle: z.string()
});

export type ImagePromptInput = z.infer<typeof ImagePromptInputSchema>;

// Stage 4: Final Image Prompt
export const FinalImagePromptSchema = z.object({
  sceneIndex: z.number(),
  paragraph1_characterStaging: z.string(),
  paragraph2_style: z.string(),
  paragraph3_background: z.string(),
  fullPrompt: z.string()
});

export type FinalImagePrompt = z.infer<typeof FinalImagePromptSchema>;

// Stage 5: Video Motion Cue Input
export const VideoMotionCueInputSchema = z.object({
  sceneSynopses: z.array(z.string()),
  characterPresenceFlags: z.array(z.boolean())
});

export type VideoMotionCueInput = z.infer<typeof VideoMotionCueInputSchema>;

// Stage 5: Motion Cue Output
export const MotionCueSchema = z.object({
  sceneIndex: z.number(),
  synopsis: z.string(),
  motionCue: z.string()
});

export type MotionCue = z.infer<typeof MotionCueSchema>;

// Error Response
export const ErrorResponseSchema = z.object({
  error: z.boolean().default(true),
  message: z.string(),
  details: z.any().optional()
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
