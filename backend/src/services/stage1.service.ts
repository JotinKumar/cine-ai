import { OpenRouterAdapter } from '../adapters/openrouter.adapter';
import { STAGE1_BLUEPRINT_ARCHITECT_PROMPT } from '../prompts/system-prompts';
import { Blueprint, StoryOutput } from '../schemas/validation.schemas';

/**
 * Stage 1 Service: Story Generation (Blueprint Architect)
 */
export class Stage1Service {
  /**
   * Compile blueprint into user prompt
   */
  private compileBlueprintPrompt(blueprint: Blueprint): string {
    return `
USER NARRATIVE BLUEPRINT:

Core Idea: ${blueprint.coreIdea}

Genre: ${blueprint.genre}

Tone & Mood: ${blueprint.toneMood}

Target Word Count: ${blueprint.wordCount} words (±3% tolerance: ${Math.floor(blueprint.wordCount * 0.97)}-${Math.ceil(blueprint.wordCount * 1.03)} words)

Language & Style: ${blueprint.languageStyle}

Narration Perspective: ${blueprint.narration}

Required Scene Count: ${blueprint.sceneCount} (EXACT)

Characters (ONLY these may appear): ${blueprint.characters.join(', ')}

${blueprint.customPrompt ? `\nAdditional Instructions:\n${blueprint.customPrompt}` : ''}

---

Generate a complete story following ALL constraints above. Remember:
- Use ONLY static imagery (frozen moments, poses, expressions)
- NO continuous action verbs
- Minimal, impactful dialogue
- Clear scene transitions
- Exact scene count: ${blueprint.sceneCount}
- Word count within ±3% of ${blueprint.wordCount}
`;
  }

  /**
   * Parse story output from LLM response
   */
  private parseStoryOutput(response: string, blueprint: Blueprint): StoryOutput {
    const lines = response.split('\n');
    
    let title = '';
    let confirmation = '';
    let storyText = '';
    let wordCount = 0;
    const scenes: string[] = [];

    let inStory = false;
    let currentScene = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract title
      if (line.includes('STORY TITLE:') || line.includes('Title:')) {
        title = lines[i + 1]?.trim() || '';
        continue;
      }

      // Extract confirmation
      if (line.includes('CONSTRAINT CONFIRMATION:') || line.includes('Confirmation:')) {
        confirmation = lines[i + 1]?.trim() || '';
        continue;
      }

      // Detect story start
      if (line.includes('STORY:') || line.includes('Scene 1:')) {
        inStory = true;
      }

      // Detect word count
      if (line.includes('WORD COUNT:')) {
        const match = line.match(/\d+/);
        if (match) {
          wordCount = parseInt(match[0]);
        }
        inStory = false;
        break;
      }

      // Collect story text and parse scenes
      if (inStory) {
        if (line.startsWith('Scene ') && line.includes(':')) {
          if (currentScene) {
            scenes.push(currentScene.trim());
          }
          currentScene = line.substring(line.indexOf(':') + 1).trim() + '\n';
        } else if (line) {
          currentScene += line + '\n';
        }
        storyText += line + '\n';
      }
    }

    // Add last scene
    if (currentScene) {
      scenes.push(currentScene.trim());
    }

    // Calculate word count if not provided
    if (wordCount === 0) {
      wordCount = storyText.split(/\s+/).filter(w => w.length > 0).length;
    }

    // Fallback extraction if parsing failed
    if (!title) {
      title = 'Untitled Story';
    }
    if (!confirmation) {
      confirmation = `Story generated with ${scenes.length} scenes and approximately ${wordCount} words.`;
    }

    return {
      title,
      storyText,
      wordCountActual: wordCount,
      constraintsConfirmation: confirmation,
      scenes: scenes.length > 0 ? scenes : [storyText]
    };
  }

  /**
   * Validate story output against blueprint constraints
   */
  private validateStoryOutput(story: StoryOutput, blueprint: Blueprint): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check scene count
    if (story.scenes.length !== blueprint.sceneCount) {
      errors.push(`Scene count mismatch: expected ${blueprint.sceneCount}, got ${story.scenes.length}`);
    }

    // Check word count tolerance (±3%)
    const minWords = Math.floor(blueprint.wordCount * 0.97);
    const maxWords = Math.ceil(blueprint.wordCount * 1.03);
    if (story.wordCountActual < minWords || story.wordCountActual > maxWords) {
      errors.push(`Word count out of range: expected ${minWords}-${maxWords}, got ${story.wordCountActual}`);
    }

    // Check for continuous action verbs (basic check)
    const continuousVerbs = ['running', 'walking', 'climbing', 'fighting', 'chasing', 'flying', 'swimming'];
    const storyLower = story.storyText.toLowerCase();
    const foundVerbs = continuousVerbs.filter(verb => storyLower.includes(verb));
    if (foundVerbs.length > 0) {
      errors.push(`Found continuous action verbs (should use static imagery): ${foundVerbs.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate story from blueprint
   */
  async generateStory(
    blueprint: Blueprint,
    apiKey: string
  ): Promise<StoryOutput> {
    try {
      // Initialize OpenRouter adapter
      const adapter = new OpenRouterAdapter(apiKey, blueprint.selectedModel);

      // Compile prompt
      const userPrompt = this.compileBlueprintPrompt(blueprint);

      // Generate story
      const result = await adapter.generate({
        prompt: userPrompt,
        systemPrompt: STAGE1_BLUEPRINT_ARCHITECT_PROMPT,
        temperature: 0.7,
        maxTokens: 6000
      });

      // Parse output
      const story = this.parseStoryOutput(result.output as string, blueprint);

      // Validate
      const validation = this.validateStoryOutput(story, blueprint);
      if (!validation.isValid) {
        console.warn('Story validation warnings:', validation.errors);
        // Don't throw error, just log warnings - allow user to regenerate if needed
      }

      return story;
    } catch (error: any) {
      console.error('Story generation error:', error);
      throw new Error(`Failed to generate story: ${error.message}`);
    }
  }
}
