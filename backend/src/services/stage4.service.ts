import { PrismaClient } from '@prisma/client';
import { BaseModelAdapter, ModelGenerationParams } from '../adapters/base.adapter';

const prisma = new PrismaClient();

// Image Prompt Paragraph Structure
interface ImagePromptParagraphs {
  characterSnippet: string;
  stagingLine: string;
  styleBackgroundLine: string;
}

// Final Image Prompt
interface FinalImagePrompt {
  fullPrompt: string;
  paragraphs: ImagePromptParagraphs;
  seed?: number;
  modelUsed: string;
}

// Asset metadata
interface AssetMetadata {
  seed: number;
  resolution: string;
  style: string;
  modelUsed: string;
  timestamp: string;
}

export class Stage4Service {
  constructor(private modelAdapter: BaseModelAdapter, private imageLlmAdapter: BaseModelAdapter) {}

  /**
   * Main entry point for Stage 4 image generation
   */
  async generateImages(
    projectId: string,
    useSeeds: boolean = true,
    customPromptOverride?: string
  ): Promise<{ success: boolean; imagesGenerated: number; assets: any[] }> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          scenes: true,
          characters: true,
        },
      });

      if (!project || !project.scenes.length) {
        throw new Error('Project or scenes not found');
      }

      const assets: any[] = [];

      // Generate image prompt and image for each scene
      for (const scene of project.scenes) {
        if (scene.isLocked) {
          continue; // Skip locked scenes
        }

        const characters = project.characters.filter(
          (char) => scene.originalScene.toLowerCase().includes(char.name.toLowerCase())
        );

        const prompt = await this.assembleImagePrompt(
          scene,
          characters,
          customPromptOverride
        );

        // Generate image using FAL.ai
        const imageUrl = await this.generateImageWithFalai(prompt);

        // Save asset to database
        const asset = await prisma.asset.create({
          data: {
            projectId,
            sceneId: scene.id,
            type: 'image',
            url: imageUrl,
            storageKey: `s3://images/${projectId}/${scene.sceneIndex}`,
            prompt: prompt.fullPrompt,
            modelUsed: 'flux-pro',
            metadata: {
              seed: useSeeds ? Math.floor(Math.random() * 1000000) : undefined,
              resolution: '1024x1024',
              style: 'cinematic',
              modelUsed: 'flux-pro',
              timestamp: new Date().toISOString(),
            },
          },
        });

        assets.push(asset);
      }

      return {
        success: true,
        imagesGenerated: assets.length,
        assets,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assemble 3-paragraph image prompt from scene and character data
   */
  async assembleImagePrompt(
    scene: any,
    characters: any[],
    customPromptOverride?: string
  ): Promise<FinalImagePrompt> {
    // Paragraph 1: Character Snippet
    const characterSnippet = this.buildCharacterSnippet(characters, scene);

    // Paragraph 2: Staging Line
    const stagingLine = this.buildStagingLine(scene, characters);

    // Paragraph 3: Style & Background Line
    const styleBackgroundLine = this.buildStyleBackgroundLine(scene);

    // Assemble full prompt
    const fullPrompt = `${characterSnippet}\n\n${stagingLine}\n\n${styleBackgroundLine}`;

    return {
      fullPrompt,
      paragraphs: {
        characterSnippet,
        stagingLine,
        styleBackgroundLine,
      },
      modelUsed: 'flux-pro',
    };
  }

  /**
   * Build character snippet paragraph (Paragraph 1)
   */
  private buildCharacterSnippet(characters: any[], scene: any): string {
    if (characters.length === 0) {
      return 'A solo environmental shot with no characters, focusing on the setting and atmosphere.';
    }

    const snippets = characters.map((char) => {
      const view = scene.view || 'Front';
      const shotType = scene.shotType || 'Medium';
      const shapeKey = shotType.toLowerCase() === 'close-up' ? 'closeup' : shotType.toLowerCase();

      const snippet =
        char.snippets?.[shapeKey]?.[view.toLowerCase()] ||
        `${char.name}, ${view.toLowerCase()} view`;

      return `${char.name}: ${snippet}`;
    });

    return snippets.join(' | ');
  }

  /**
   * Build staging line paragraph (Paragraph 2)
   */
  private buildStagingLine(scene: any, characters: any[]): string {
    const staging = scene.staging || 'Standard staging';
    const relationalStaging = scene.relationalStaging || '';
    const sceneFunction = scene.sceneFunction || 'Advance the narrative';

    const stoppingPoints =
      characters.length > 1 && relationalStaging ? `with ${relationalStaging}` : '';

    return `${staging} ${stoppingPoints}. Scene function: ${sceneFunction}.`;
  }

  /**
   * Build style and background line paragraph (Paragraph 3)
   */
  private buildStyleBackgroundLine(scene: any): string {
    const background = scene.backgroundBlueprint as any;
    const masterLocation = background?.master_location || 'Cinematic setting';
    const lighting = background?.lighting || 'Natural lighting';
    const atmospheric = background?.atmospheric_details || 'Neutral atmosphere';

    return `${masterLocation}. Lighting: ${lighting}. Atmosphere: ${atmospheric}. Cinematic, professional photography.`;
  }

  /**
   * Generate image using FAL.ai FLUX model
   */
  private async generateImageWithFalai(prompt: FinalImagePrompt): Promise<string> {
    const params: ModelGenerationParams = {
      prompt: prompt.fullPrompt,
      maxTokens: 1000,
    };

    const result = await this.modelAdapter.generate(params);

    // Extract URL from result (would depend on FAL.ai response format)
    const url = typeof result.output === 'string' ? result.output : (result.output as any).url;

    if (!url) {
      throw new Error('Failed to generate image URL from FAL.ai');
    }

    return url;
  }

  /**
   * Regenerate image for a specific scene
   */
  async regenerateSceneImage(projectId: string, sceneId: string): Promise<string> {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { project: { include: { characters: true } } },
    });

    if (!scene) {
      throw new Error('Scene not found');
    }

    const characters = (scene.project?.characters || []).filter(
      (char) => scene.originalScene.toLowerCase().includes(char.name.toLowerCase())
    );

    const prompt = await this.assembleImagePrompt(scene, characters);
    const imageUrl = await this.generateImageWithFalai(prompt);

    // Update or create asset
    const existingAsset = await prisma.asset.findFirst({
      where: {
        sceneId,
        type: 'image',
      },
    });

    if (existingAsset) {
      await prisma.asset.update({
        where: { id: existingAsset.id },
        data: {
          url: imageUrl,
          prompt: prompt.fullPrompt,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.asset.create({
        data: {
          projectId,
          sceneId,
          type: 'image',
          url: imageUrl,
          storageKey: `s3://images/${projectId}/${sceneId}`,
          prompt: prompt.fullPrompt,
          modelUsed: 'flux-pro',
          metadata: {
            seed: Math.floor(Math.random() * 1000000),
            resolution: '1024x1024',
            style: 'cinematic',
            modelUsed: 'flux-pro',
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return imageUrl;
  }

  /**
   * Lock an asset to prevent regeneration
   */
  async lockAsset(assetId: string): Promise<void> {
    await prisma.asset.update({
      where: { id: assetId },
      data: { isLocked: true },
    });
  }

  /**
   * Unlock an asset for regeneration
   */
  async unlockAsset(assetId: string): Promise<void> {
    await prisma.asset.update({
      where: { id: assetId },
      data: { isLocked: false },
    });
  }

  /**
   * Get all assets for a project
   */
  async getProjectAssets(projectId: string) {
    return await prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    await prisma.asset.delete({
      where: { id: assetId },
    });
  }
}
