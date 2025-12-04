import { OpenRouterAdapter } from '../adapters/openrouter.adapter';
import { STAGE2_VALIDATOR_PROMPT } from '../prompts/system-prompts';
import { ValidationOutput, Blueprint, StoryOutput } from '../schemas/validation.schemas';

type Story = StoryOutput;

/**
 * Stage 2 Service: Story Editing & Validation
 */
export class Stage2Service {
  /**
   * Compile validation prompt for edited scenes
   */
  private compileValidationPrompt(
    blueprint: Blueprint,
    originalScenes: string[],
    editedScenes: string[]
  ): string {
    return `
ORIGINAL BLUEPRINT CONSTRAINTS:
- Scene Count: ${blueprint.sceneCount} (EXACT)
- Characters: ${blueprint.characters.join(', ')}
- Narration: ${blueprint.narration}
- Genre: ${blueprint.genre}
- Tone: ${blueprint.toneMood}

ORIGINAL SCENES:
${originalScenes.map((scene, i) => `Scene ${i + 1}:\n${scene}`).join('\n\n')}

EDITED SCENES:
${editedScenes.map((scene, i) => `Scene ${i + 1}:\n${scene}`).join('\n\n')}

VALIDATION CHECKLIST:
1. Scene count matches blueprint (exactly ${blueprint.sceneCount})
2. Only blueprint characters appear (no new characters)
3. POV/Narration is consistent with blueprint
4. Genre and tone alignment maintained
5. No continuous action verbs used (static imagery only)
6. Dialogue remains sparse and impactful
7. Scene boundaries are preserved

Please validate these edited scenes against all constraints and provide detailed feedback.`;
  }

  /**
   * Parse validation response from LLM
   */
  private parseValidationResponse(response: string): ValidationOutput {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      const isValid = !response.toLowerCase().includes('error') && 
                      !response.toLowerCase().includes('violation');

      return {
        isValid,
        errors: isValid ? [] : [{
          type: 'soft',
          field: 'general',
          message: 'Please review the scenes for potential issues'
        }],
        warnings: []
      };
    } catch (error) {
      console.error('Validation parsing error:', error);
      return {
        isValid: true,
        errors: [],
        warnings: ['Could not fully validate - manual review recommended']
      };
    }
  }

  /**
   * Validate edited story against blueprint constraints
   */
  async validateStory(
    blueprint: Blueprint,
    originalScenes: string[],
    editedScenes: string[],
    apiKey: string
  ): Promise<ValidationOutput> {
    try {
      // Check basic constraints
      const basicValidation = this.validateBasicConstraints(
        blueprint,
        editedScenes
      );

      if (!basicValidation.isValid) {
        return basicValidation;
      }

      // Use LLM for semantic validation
      const adapter = new OpenRouterAdapter(apiKey, blueprint.selectedModel);

      const prompt = this.compileValidationPrompt(
        blueprint,
        originalScenes,
        editedScenes
      );

      const result = await adapter.generate({
        prompt,
        systemPrompt: STAGE2_VALIDATOR_PROMPT,
        temperature: 0.3,
        maxTokens: 2000
      });

      return this.parseValidationResponse(result.output as string);
    } catch (error: any) {
      console.error('Story validation error:', error);
      throw new Error(`Failed to validate story: ${error.message}`);
    }
  }

  /**
   * Validate basic structural constraints
   */
  private validateBasicConstraints(
    blueprint: Blueprint,
    editedScenes: string[]
  ): ValidationOutput {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Check scene count
    if (editedScenes.length !== blueprint.sceneCount) {
      errors.push({
        type: 'hard',
        field: 'sceneCount',
        message: `Scene count mismatch: expected ${blueprint.sceneCount}, got ${editedScenes.length}`
      });
    }

    // Check for new characters
    const sceneText = editedScenes.join(' ').toLowerCase();
    const namesToCheck = blueprint.characters.map(n => n.toLowerCase());
    
    // Simple check for common name patterns
    const potentialNewNames = sceneText.match(/\b[A-Z][a-z]+ (?:says|thinks|is|was|stood|sat)\b/g) || [];
    const unknownNames = potentialNewNames.filter(
      name => !namesToCheck.some(bn => name.toLowerCase().includes(bn))
    );

    if (unknownNames.length > 0) {
      warnings.push(`Potential new characters detected: ${unknownNames.join(', ')}. Please verify only blueprint characters are used.`);
    }

    // Check for continuous action verbs
    const continuousVerbs = ['running', 'walking', 'climbing', 'fighting', 'chasing'];
    const foundVerbs = continuousVerbs.filter(verb => sceneText.includes(verb));
    if (foundVerbs.length > 0) {
      warnings.push(`Found continuous action verbs (use static imagery): ${foundVerbs.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Regenerate individual scene with constraints
   */
  async regenerateScene(
    blueprint: Blueprint,
    sceneIndex: number,
    instructions: string,
    apiKey: string
  ): Promise<string> {
    try {
      const adapter = new OpenRouterAdapter(apiKey, blueprint.selectedModel);

      const prompt = `
You are rewriting Scene ${sceneIndex + 1} of a cinematic story.

CONSTRAINTS:
- Genre: ${blueprint.genre}
- Tone: ${blueprint.toneMood}
- Characters (only these): ${blueprint.characters.join(', ')}
- Narration: ${blueprint.narration}
- Use static imagery (frozen moments, poses)
- NO continuous action verbs
- Minimal dialogue

INSTRUCTIONS: ${instructions}

Generate ONLY the new scene text, nothing else.`;

      const result = await adapter.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 2000
      });

      return result.output as string;
    } catch (error: any) {
      console.error('Scene regeneration error:', error);
      throw new Error(`Failed to regenerate scene: ${error.message}`);
    }
  }

  /**
   * Edit and finalize story
   */
  async editStory(
    projectId: string,
    blueprint: Blueprint,
    originalStory: Story,
    editRequests: Array<{
      sceneIndex: number
      editType: 'modify' | 'regenerate'
      instructions: string
    }>,
    apiKey: string,
    prisma: any
  ): Promise<Story> {
    try {
      let editedScenes = [...originalStory.scenes];

      // Process each edit request
      for (const edit of editRequests) {
        if (edit.editType === 'regenerate') {
          editedScenes[edit.sceneIndex] = await this.regenerateScene(
            blueprint,
            edit.sceneIndex,
            edit.instructions,
            apiKey
          );
        }
        // For 'modify', user is directly editing in UI
      }

      // Validate the edited story
      const validation = await this.validateStory(
        blueprint,
        originalStory.scenes,
        editedScenes,
        apiKey
      );

      // Check for hard errors
      const hardErrors = validation.errors.filter(e => e.type === 'hard');
      if (hardErrors.length > 0) {
        throw new Error(`Validation failed: ${hardErrors.map(e => e.message).join(', ')}`);
      }

      // Save updated story
      const updatedStory = await prisma.story.update({
        where: { projectId },
        data: {
          scenes: editedScenes,
          isValidated: true,
          validationErrors: {
            soft: validation.errors.filter(e => e.type === 'soft'),
            warnings: validation.warnings
          },
          updatedAt: new Date()
        }
      });

      return updatedStory;
    } catch (error: any) {
      console.error('Story edit error:', error);
      throw new Error(`Failed to edit story: ${error.message}`);
    }
  }
}
