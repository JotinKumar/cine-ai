import { PrismaClient } from '@prisma/client';
import { BaseModelAdapter, ModelGenerationParams } from '../adapters/base.adapter';

const prisma = new PrismaClient();

// Narrative Logic Priority: Action Type → Allowed View Types
const NARRATIVE_LOGIC_PRIORITY: Record<string, string[]> = {
  'dialog': ['Close-up', 'Medium', 'Wide'],
  'action': ['Wide', 'Medium'],
  'reaction': ['Close-up', 'Medium'],
  'environment_reveal': ['Wide'],
  'movement': ['Medium', 'Wide'],
  'internal_state': ['Close-up'],
  'group_interaction': ['Medium', 'Wide'],
  'intimate_moment': ['Close-up', 'Medium'],
  'establishing': ['Wide'],
};

// Shot Blueprint Structure
interface ShotBlueprint {
  shotType: 'Wide' | 'Medium' | 'Close-up';
  angle: string;
  view: 'Front' | 'Back' | 'OTS' | 'Profile' | 'Side';
  staging: string;
  relationalStaging?: string;
  sceneFunction: string;
}

// Character Profile Structure (FFCPP Format)
interface CharacterProfile {
  name: string;
  role: string;
  appearance: {
    eyes: string;
    skin: string;
    hair: string;
  };
  outfit: {
    upper: string;
    lower: string;
    footwear: string;
  };
  props: string[];
  snippets: {
    closeup: Record<string, string>;
    medium: Record<string, string>;
    wide: Record<string, string>;
  };
}

// Background Blueprint Structure
interface BackgroundBlueprint {
  master_location: string;
  overlay_elements: string[];
  lighting: string;
  atmospheric_details: string;
}

export class Stage3Service {
  constructor(private modelAdapter: BaseModelAdapter) {}

  /**
   * Main entry point for Stage 3 scene generation
   */
  async generateScenes(
    projectId: string,
    customPromptOverride?: string
  ): Promise<{ success: boolean; characters: CharacterProfile[]; sceneCount: number }> {
    try {
      // Fetch project with story
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { story: true, blueprint: true },
      });

      if (!project || !project.story) {
        throw new Error('Project or story not found');
      }

      // Step 1: Generate character profiles
      const characters = await this.generateCharacterProfiles(
        project.story.storyText,
        project.blueprint?.characters || [],
        customPromptOverride
      );

      // Step 2: Generate shot blueprints for each scene
      const scenes = project.story.scenes || [];
      for (let i = 0; i < scenes.length; i++) {
        const sceneText = scenes[i];
        const shotBlueprint = await this.generateShotBlueprint(sceneText, i, characters);
        const backgroundBlueprint = await this.generateBackgroundBlueprint(sceneText);

        // Save to database
        await prisma.scene.upsert({
          where: {
            projectId_sceneIndex: { projectId, sceneIndex: i },
          },
          create: {
            projectId,
            sceneIndex: i,
            originalScene: sceneText,
            shotType: shotBlueprint.shotType,
            angle: shotBlueprint.angle,
            view: shotBlueprint.view,
            staging: shotBlueprint.staging,
            relationalStaging: shotBlueprint.relationalStaging,
            sceneFunction: shotBlueprint.sceneFunction,
            backgroundBlueprint: backgroundBlueprint as any,
          },
          update: {
            shotType: shotBlueprint.shotType,
            angle: shotBlueprint.angle,
            view: shotBlueprint.view,
            staging: shotBlueprint.staging,
            relationalStaging: shotBlueprint.relationalStaging,
            sceneFunction: shotBlueprint.sceneFunction,
            backgroundBlueprint: backgroundBlueprint as any,
          },
        });
      }

      // Save character profiles
      for (const char of characters) {
        await prisma.character.upsert({
          where: {
            projectId_name: { projectId, name: char.name },
          },
          create: {
            projectId,
            name: char.name,
            role: char.role,
            appearance: char.appearance,
            outfit: char.outfit,
            props: char.props,
            snippets: char.snippets,
            designPrompt: `Character: ${char.name} (${char.role})`,
          },
          update: {
            role: char.role,
            appearance: char.appearance,
            outfit: char.outfit,
            props: char.props,
            snippets: char.snippets,
          },
        });
      }

      return {
        success: true,
        characters,
        sceneCount: scenes.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate character profiles with FFCPP format
   */
  private async generateCharacterProfiles(
    storyText: string,
    characterNames: string[],
    customPromptOverride?: string
  ): Promise<CharacterProfile[]> {
    const characterPrompt = customPromptOverride || `
You are a Character Design Specialist. Extract detailed character profiles from this story.

STORY:
${storyText}

CHARACTER NAMES TO EXTRACT:
${characterNames.join(', ')}

For EACH character, generate:
1. APPEARANCE (eyes, skin, hair)
2. OUTFIT in FFCPP format:
   - Upper: Specific garment details
   - Lower: Specific garment details
   - Footwear: Specific shoe details
3. PROPS: List any carried items
4. SNIPPETS: 9 cinematic descriptions (3x3 grid):
   - Close-up (Front, Side, Back)
   - Medium (Front, Side, Back)
   - Wide (Front, Side, Back)

Return VALID JSON array of characters.
`;

    const params: ModelGenerationParams = {
      prompt: characterPrompt,
      systemPrompt: 'You are a character design specialist who creates detailed FFCPP character profiles.',
      temperature: 0.7,
    };

    const result = await this.modelAdapter.generate(params);
    const responseText = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);

    try {
      // Parse response - handle both JSON arrays and wrapped responses
      let parsed = JSON.parse(responseText);
      if (!Array.isArray(parsed)) {
        parsed = parsed.characters || [parsed];
      }

      return parsed.map((char: any) => ({
        name: char.name || '',
        role: char.role || 'Character',
        appearance: {
          eyes: char.appearance?.eyes || 'Not specified',
          skin: char.appearance?.skin || 'Not specified',
          hair: char.appearance?.hair || 'Not specified',
        },
        outfit: {
          upper: char.outfit?.upper || 'Not specified',
          lower: char.outfit?.lower || 'Not specified',
          footwear: char.outfit?.footwear || 'Not specified',
        },
        props: Array.isArray(char.props) ? char.props : [],
        snippets: {
          closeup: {
            front: char.snippets?.closeup?.front || 'Character close-up, front view',
            side: char.snippets?.closeup?.side || 'Character close-up, side view',
            back: char.snippets?.closeup?.back || 'Character close-up, back view',
          },
          medium: {
            front: char.snippets?.medium?.front || 'Character medium shot, front view',
            side: char.snippets?.medium?.side || 'Character medium shot, side view',
            back: char.snippets?.medium?.back || 'Character medium shot, back view',
          },
          wide: {
            front: char.snippets?.wide?.front || 'Character wide shot, front view',
            side: char.snippets?.wide?.side || 'Character wide shot, side view',
            back: char.snippets?.wide?.back || 'Character wide shot, back view',
          },
        },
      }));
    } catch (error) {
      // Return default character profiles if parsing fails
      return characterNames.map((name) => ({
        name,
        role: 'Character',
        appearance: { eyes: 'Blue', skin: 'Fair', hair: 'Brown' },
        outfit: { upper: 'Casual shirt', lower: 'Jeans', footwear: 'Sneakers' },
        props: [],
        snippets: {
          closeup: {
            front: `${name} close-up, front view`,
            side: `${name} close-up, side view`,
            back: `${name} close-up, back view`,
          },
          medium: {
            front: `${name} medium shot, front view`,
            side: `${name} medium shot, side view`,
            back: `${name} medium shot, back view`,
          },
          wide: {
            front: `${name} wide shot, front view`,
            side: `${name} wide shot, side view`,
            back: `${name} wide shot, back view`,
          },
        },
      }));
    }
  }

  /**
   * Generate shot blueprint for a scene using Narrative Logic Priority
   */
  private async generateShotBlueprint(
    sceneText: string,
    sceneIndex: number,
    characters: CharacterProfile[]
  ): Promise<ShotBlueprint> {
    const characterList = characters.map((c) => c.name).join(', ');

    const shotPrompt = `
You are a Keyframe Director. Analyze this scene and generate ONE optimal shot blueprint.

SCENE TEXT:
${sceneText}

AVAILABLE CHARACTERS: ${characterList}

NARRATIVE_LOGIC_PRIORITY (Action Type → Allowed Views):
${JSON.stringify(NARRATIVE_LOGIC_PRIORITY, null, 2)}

Generate ONE shot blueprint with:
1. SHOT_TYPE: Choose from "Wide", "Medium", or "Close-up"
2. ANGLE: Camera angle (e.g., "Low angle", "Eye level", "High angle")
3. VIEW: Camera view - "Front", "Back", "OTS" (Over-The-Shoulder), "Profile", or "Side"
4. STAGING: Describe actor/object positions relative to frame
5. RELATIONAL_STAGING: Describe relationships between multiple elements
6. SCENE_FUNCTION: What does this shot accomplish narratively?

CONSTRAINT: Choose shot type based on NARRATIVE_LOGIC_PRIORITY for the primary action in this scene.

Return valid JSON object with these exact keys.
`;

    const params: ModelGenerationParams = {
      prompt: shotPrompt,
      systemPrompt: 'You are a cinematography expert who creates shot blueprints following narrative logic principles.',
      temperature: 0.6,
    };

    const result = await this.modelAdapter.generate(params);
    const responseText = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);

    try {
      const parsed = JSON.parse(responseText);
      return {
        shotType: this.validateShotType(parsed.SHOT_TYPE || 'Medium'),
        angle: parsed.ANGLE || 'Eye level',
        view: this.validateView(parsed.VIEW || 'Front'),
        staging: parsed.STAGING || 'Standard staging',
        relationalStaging: parsed.RELATIONAL_STAGING,
        sceneFunction: parsed.SCENE_FUNCTION || 'Advance narrative',
      };
    } catch (error) {
      // Return default shot blueprint
      return {
        shotType: 'Medium',
        angle: 'Eye level',
        view: 'Front',
        staging: 'Standard staging',
        sceneFunction: 'Advance narrative',
      };
    }
  }

  /**
   * Generate background blueprint for a scene
   */
  private async generateBackgroundBlueprint(sceneText: string): Promise<BackgroundBlueprint> {
    const backgroundPrompt = `
You are a Production Designer. Analyze this scene and create a background blueprint.

SCENE TEXT:
${sceneText}

Generate a background blueprint with:
1. MASTER_LOCATION: The primary setting (e.g., "Modern office building, glass walls")
2. OVERLAY_ELEMENTS: Array of secondary/interactive elements
3. LIGHTING: Describe lighting mood and direction
4. ATMOSPHERIC_DETAILS: Weather, time of day, special effects, etc.

Return valid JSON object with these exact keys.
`;

    const params: ModelGenerationParams = {
      prompt: backgroundPrompt,
      systemPrompt: 'You are a production designer creating detailed background blueprints for cinematic scenes.',
      temperature: 0.7,
    };

    const result = await this.modelAdapter.generate(params);
    const responseText = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);

    try {
      const parsed = JSON.parse(responseText);
      return {
        master_location: parsed.MASTER_LOCATION || 'Interior setting',
        overlay_elements: Array.isArray(parsed.OVERLAY_ELEMENTS)
          ? parsed.OVERLAY_ELEMENTS
          : ['Standard elements'],
        lighting: parsed.LIGHTING || 'Soft, natural lighting',
        atmospheric_details: parsed.ATMOSPHERIC_DETAILS || 'Clear, neutral atmosphere',
      };
    } catch (error) {
      return {
        master_location: 'Scene setting',
        overlay_elements: ['Props', 'Furniture'],
        lighting: 'Natural lighting',
        atmospheric_details: 'Neutral atmosphere',
      };
    }
  }

  /**
   * Validate and normalize shot type
   */
  private validateShotType(shotType: string): 'Wide' | 'Medium' | 'Close-up' {
    const normalized = shotType?.toLowerCase().trim() || 'medium';
    if (normalized.includes('wide') || normalized.includes('establishing')) return 'Wide';
    if (normalized.includes('close') || normalized.includes('closeup')) return 'Close-up';
    return 'Medium';
  }

  /**
   * Validate and normalize view
   */
  private validateView(view: string): 'Front' | 'Back' | 'OTS' | 'Profile' | 'Side' {
    const normalized = view?.toLowerCase().trim() || 'front';
    if (normalized.includes('back')) return 'Back';
    if (normalized.includes('ots') || normalized.includes('over')) return 'OTS';
    if (normalized.includes('profile')) return 'Profile';
    if (normalized.includes('side')) return 'Side';
    return 'Front';
  }

  /**
   * Regenerate a specific scene's shot blueprint
   */
  async regenerateSceneBlueprint(
    projectId: string,
    sceneIndex: number,
    customPrompt?: string
  ): Promise<ShotBlueprint> {
    const scene = await prisma.scene.findUnique({
      where: {
        projectId_sceneIndex: { projectId, sceneIndex },
      },
    });

    if (!scene) {
      throw new Error('Scene not found');
    }

    const characters = await prisma.character.findMany({
      where: { projectId },
    });

    const shotBlueprint = await this.generateShotBlueprint(
      scene.originalScene,
      sceneIndex,
      characters as any
    );

    await prisma.scene.update({
      where: {
        projectId_sceneIndex: { projectId, sceneIndex },
      },
      data: {
        shotType: shotBlueprint.shotType,
        angle: shotBlueprint.angle,
        view: shotBlueprint.view,
        staging: shotBlueprint.staging,
        relationalStaging: shotBlueprint.relationalStaging,
        sceneFunction: shotBlueprint.sceneFunction,
      },
    });

    return shotBlueprint;
  }

  /**
   * Lock a scene to prevent further generation
   */
  async lockScene(projectId: string, sceneIndex: number): Promise<void> {
    await prisma.scene.update({
      where: {
        projectId_sceneIndex: { projectId, sceneIndex },
      },
      data: { isLocked: true },
    });
  }

  /**
   * Unlock a scene for further editing
   */
  async unlockScene(projectId: string, sceneIndex: number): Promise<void> {
    await prisma.scene.update({
      where: {
        projectId_sceneIndex: { projectId, sceneIndex },
      },
      data: { isLocked: false },
    });
  }
}
