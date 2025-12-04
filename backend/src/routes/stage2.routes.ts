import { Router, Request, Response } from 'express';
import { Stage2Service } from '../services/stage2.service';
import { prisma } from '../index';

const router = Router();
const stage2Service = new Stage2Service();

/**
 * POST /api/stage2/story-editing
 * Edit story and validate against blueprint constraints
 */
router.post('/story-editing', async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      editRequests,
      apiKey
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: true,
        message: 'projectId is required'
      });
    }

    // Get original story and blueprint
    const story = await prisma.story.findUnique({
      where: { projectId }
    });

    const blueprint = await prisma.blueprint.findUnique({
      where: { projectId }
    });

    if (!story || !blueprint) {
      return res.status(404).json({
        error: true,
        message: 'Story or blueprint not found'
      });
    }

    // Edit and validate story
    const updatedStory = await stage2Service.editStory(
      projectId,
      blueprint as any,
      story as any,
      editRequests || [],
      apiKey || process.env.OPENROUTER_API_KEY,
      prisma
    );

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'stage2_complete',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      story: updatedStory
    });
  } catch (error: any) {
    console.error('Stage 2 error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to edit story'
    });
  }
});

/**
 * POST /api/stage2/validate
 * Validate story without editing
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { projectId, editedScenes, apiKey } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: true,
        message: 'projectId is required'
      });
    }

    const story = await prisma.story.findUnique({
      where: { projectId }
    });

    const blueprint = await prisma.blueprint.findUnique({
      where: { projectId }
    });

    if (!story || !blueprint) {
      return res.status(404).json({
        error: true,
        message: 'Story or blueprint not found'
      });
    }

    // Validate
    const validation = await stage2Service.validateStory(
      blueprint as any,
      story.scenes,
      editedScenes,
      apiKey || process.env.OPENROUTER_API_KEY
    );

    res.json({
      success: true,
      validation
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Validation failed'
    });
  }
});

/**
 * POST /api/stage2/regenerate-scene
 * Regenerate individual scene
 */
router.post('/regenerate-scene', async (req: Request, res: Response) => {
  try {
    const { projectId, sceneIndex, instructions, apiKey } = req.body;

    if (!projectId || sceneIndex === undefined) {
      return res.status(400).json({
        error: true,
        message: 'projectId and sceneIndex are required'
      });
    }

    const blueprint = await prisma.blueprint.findUnique({
      where: { projectId }
    });

    if (!blueprint) {
      return res.status(404).json({
        error: true,
        message: 'Blueprint not found'
      });
    }

    // Regenerate scene
    const regeneratedScene = await stage2Service.regenerateScene(
      blueprint as any,
      sceneIndex,
      instructions,
      apiKey || process.env.OPENROUTER_API_KEY
    );

    res.json({
      success: true,
      scene: regeneratedScene
    });
  } catch (error: any) {
    console.error('Scene regeneration error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to regenerate scene'
    });
  }
});

export default router;
