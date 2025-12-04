import { PrismaClient } from '@prisma/client';
import { BaseModelAdapter, ModelGenerationParams } from '../adapters/base.adapter';

const prisma = new PrismaClient();

// Motion Cue Structure (≤40 words, 1 sentence, no continuous actions)
interface MotionCue {
  sceneIndex: number;
  synopsis: string; // One sentence scene summary
  motionCue: string; // ≤40 words motion cue
  characterMotion: string[]; // Per-character motion constraints
}

// Video Generation Job
interface VideoJob {
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
}

export class Stage5Service {
  constructor(private modelAdapter: BaseModelAdapter, private videoLlmAdapter: BaseModelAdapter) {}

  /**
   * Main entry point for Stage 5 video assembly
   */
  async generateVideo(
    projectId: string,
    withAudio: boolean = true
  ): Promise<{ success: boolean; videoUrl: string; jobId: string }> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          scenes: true,
          characters: true,
          assets: true,
        },
      });

      if (!project || !project.scenes.length || !project.assets.length) {
        throw new Error('Project, scenes, or images not found');
      }

      // Step 1: Generate motion cues for all scenes
      const motionCues = await this.generateMotionCues(project);

      // Step 2: Assemble video with FAL.ai
      const videoUrl = await this.assembleVideoWithFalai(project, motionCues);

      // Step 3: Save video asset to database
      const videoAsset = await prisma.asset.create({
        data: {
          projectId,
          type: 'video',
          url: videoUrl,
          storageKey: `s3://videos/${projectId}/final-video`,
          modelUsed: 'fal-ai-video',
          metadata: {
            duration: 'calculated-from-api',
            fps: 24,
            resolution: '1080p',
            withAudio: withAudio,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        videoUrl,
        jobId: videoAsset.id,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate motion cues for all scenes
   */
  private async generateMotionCues(project: any): Promise<MotionCue[]> {
    const motionCues: MotionCue[] = [];

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];
      const motionCue = await this.generateMotionCueForScene(scene, project.characters);

      motionCues.push(motionCue);

      // Save motion cue to database (if needed)
    }

    return motionCues;
  }

  /**
   * Generate motion cue for a specific scene
   */
  private async generateMotionCueForScene(scene: any, characters: any[]): Promise<MotionCue> {
    const characterList = characters.map((c) => c.name).join(', ');

    const motionPrompt = `
You are a Motion Cue Specialist. Generate ONE concise motion cue for this scene.

SCENE TEXT:
${scene.originalScene}

AVAILABLE CHARACTERS: ${characterList}

SHOT BLUEPRINT:
- Shot Type: ${scene.shotType}
- View: ${scene.view}
- Staging: ${scene.staging}

RULES:
1. Motion cue MUST be ≤40 words
2. MUST be ONE sentence only
3. NO continuous action verbs (no "running", "walking continuously", "perpetual motion")
4. Only subtle gestures and minimal movement
5. If no characters in scene, describe environment-only motion (wind, light, subtle effects)
6. Focus on emotional/narrative function, not excessive action

Output format:
{
  "synopsis": "One sentence scene summary",
  "motion_cue": "Your motion cue here (≤40 words)",
  "character_motion": ["character1: specific motion", "character2: specific motion"]
}
`;

    const params: ModelGenerationParams = {
      prompt: motionPrompt,
      systemPrompt:
        'You are a motion cue specialist creating concise, narrative-focused motion directions for cinematic scenes.',
      temperature: 0.6,
    };

    const result = await this.modelAdapter.generate(params);
    const responseText = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);

    try {
      const parsed = JSON.parse(responseText);
      const motionCueText = parsed.motion_cue || parsed.motionCue || '';

      // Validate motion cue word count
      const wordCount = motionCueText.split(/\s+/).length;
      if (wordCount > 40) {
        const trimmed = motionCueText.split(/\s+/).slice(0, 40).join(' ') + '.';
        parsed.motion_cue = trimmed;
      }

      return {
        sceneIndex: scene.sceneIndex,
        synopsis: parsed.synopsis || 'Scene continuation',
        motionCue: parsed.motion_cue || 'Subtle ambient motion',
        characterMotion: Array.isArray(parsed.character_motion) ? parsed.character_motion : [],
      };
    } catch (error) {
      // Return default motion cue if parsing fails
      return {
        sceneIndex: scene.sceneIndex,
        synopsis: 'Scene progression',
        motionCue: 'Subtle movement and ambient atmosphere.',
        characterMotion: [],
      };
    }
  }

  /**
   * Assemble video using FAL.ai video model
   */
  private async assembleVideoWithFalai(project: any, motionCues: MotionCue[]): Promise<string> {
    const videoParams: ModelGenerationParams = {
      prompt: `Generate cinematic video from ${project.scenes.length} scenes with motion cues`,
      maxTokens: 2000,
    };

    const result = await this.modelAdapter.generate(videoParams);

    // Extract video URL from result (depends on FAL.ai response format)
    const videoUrl = typeof result.output === 'string' ? result.output : (result.output as any).url;

    if (!videoUrl) {
      throw new Error('Failed to generate video URL from FAL.ai');
    }

    return videoUrl;
  }

  /**
   * Generate audio narration for project
   */
  async generateAudio(
    projectId: string,
    narrationStyle: string = 'neutral'
  ): Promise<{ success: boolean; audioUrl: string }> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { story: true, blueprint: true },
      });

      if (!project || !project.story) {
        throw new Error('Project or story not found');
      }

      // Generate audio narration script
      const audioPrompt = `
Create narration from this story text in a ${narrationStyle} tone.

STORY:
${project.story.storyText}

Output: Clear, professional narration suitable for a cinematic video.
`;

      const params: ModelGenerationParams = {
        prompt: audioPrompt,
        systemPrompt: 'You are a professional voice-over artist creating narration for cinematic videos.',
        temperature: 0.5,
      };

      const result = await this.modelAdapter.generate(params);
      const narrationText = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);

      // Convert text to speech using FAL.ai audio model
      const audioUrl = await this.textToSpeech(narrationText, narrationStyle);

      // Save audio asset
      await prisma.asset.create({
        data: {
          projectId,
          type: 'audio',
          url: audioUrl,
          storageKey: `s3://audio/${projectId}/narration`,
          modelUsed: 'fal-ai-audio',
          prompt: narrationText,
          metadata: {
            narrationStyle,
            duration: 'calculated-from-api',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        audioUrl,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert text to speech
   */
  private async textToSpeech(text: string, style: string): Promise<string> {
    const params: ModelGenerationParams = {
      prompt: `Generate audio narration: ${text}`,
      maxTokens: 1000,
    };

    const result = await this.modelAdapter.generate(params);
    const audioUrl = typeof result.output === 'string' ? result.output : (result.output as any).url;

    if (!audioUrl) {
      throw new Error('Failed to generate audio URL');
    }

    return audioUrl;
  }

  /**
   * Get video generation job status
   */
  async getVideoJobStatus(projectId: string): Promise<VideoJob> {
    const videoAsset = await prisma.asset.findFirst({
      where: {
        projectId,
        type: 'video',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!videoAsset) {
      return {
        projectId,
        status: 'pending',
        progress: 0,
      };
    }

    const metadata = videoAsset.metadata as any;

    return {
      projectId,
      status: videoAsset.url ? 'completed' : 'processing',
      progress: videoAsset.url ? 100 : (metadata?.progress || 0),
      errorMessage: metadata?.error,
    };
  }

  /**
   * Cancel video generation
   */
  async cancelVideoGeneration(projectId: string): Promise<void> {
    const videoAsset = await prisma.asset.findFirst({
      where: {
        projectId,
        type: 'video',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (videoAsset) {
      await prisma.asset.delete({
        where: { id: videoAsset.id },
      });
    }
  }

  /**
   * Export final video
   */
  async exportVideo(
    projectId: string,
    format: 'mp4' | 'webm' = 'mp4',
    quality: '1080p' | '720p' | '480p' = '1080p'
  ): Promise<{ success: boolean; downloadUrl: string }> {
    const videoAsset = await prisma.asset.findFirst({
      where: {
        projectId,
        type: 'video',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!videoAsset) {
      throw new Error('No video found for this project');
    }

    // In a real implementation, this would transcode and prepare for download
    return {
      success: true,
      downloadUrl: videoAsset.url,
    };
  }
}
