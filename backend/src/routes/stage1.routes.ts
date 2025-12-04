import { Router, Request, Response } from 'express';
import { Stage1Service } from '../services/stage1.service';
import { BlueprintSchema } from '../schemas/validation.schemas';
import { prisma } from '../index';

const router = Router();
const stage1Service = new Stage1Service();

/**
 * POST /api/stage1/story-generation
 * Generate story from blueprint
 */
router.post('/story-generation', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const blueprint = BlueprintSchema.parse(req.body);
    const projectId = req.body.projectId;

    if (!projectId) {
      return res.status(400).json({
        error: true,
        message: 'projectId is required'
      });
    }

    // Get API key (from user's stored keys or request)
    const apiKey = req.body.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: true,
        message: 'OpenRouter API key is required'
      });
    }

    // Generate story
    const story = await stage1Service.generateStory(blueprint, apiKey);

    // Save blueprint to database
    await prisma.blueprint.upsert({
      where: { projectId },
      create: {
        projectId,
        ...blueprint
      },
      update: blueprint
    });

    // Save story to database
    const savedStory = await prisma.story.upsert({
      where: { projectId },
      create: {
        projectId,
        ...story,
        selectedModel: blueprint.selectedModel,
        isValidated: true
      },
      update: {
        ...story,
        selectedModel: blueprint.selectedModel,
        isValidated: true,
        updatedAt: new Date()
      }
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'stage1_complete',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      story: savedStory
    });
  } catch (error: any) {
    console.error('Stage 1 error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: true,
        message: 'Invalid blueprint data',
        details: error.errors
      });
    }

    res.status(500).json({
      error: true,
      message: error.message || 'Failed to generate story'
    });
  }
});

/**
 * GET /api/stage1/story/:projectId
 * Get generated story for a project
 */
router.get('/story/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const story = await prisma.story.findUnique({
      where: { projectId },
      include: {
        project: {
          include: {
            blueprint: true
          }
        }
      }
    });

    if (!story) {
      return res.status(404).json({
        error: true,
        message: 'Story not found'
      });
    }

    res.json({
      success: true,
      story,
      blueprint: story.project.blueprint
    });
  } catch (error: any) {
    console.error('Get story error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to retrieve story'
    });
  }
});

export default router;
