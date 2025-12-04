import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    let { userId, name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: true,
        message: 'name is required'
      });
    }

    // For development: create or reuse default user
    let user;
    
    if (userId) {
      // Try to find existing user by ID
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    }

    // If no user found or no userId provided, use/create default dev user
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: 'dev@cine-ai.local' }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'dev@cine-ai.local',
            password: 'dev-password',
            name: 'Development User'
          }
        });
      }
    }

    userId = user.id;

    const project = await prisma.project.create({
      data: {
        userId,
        name,
        status: 'draft'
      }
    });

    res.json({
      success: true,
      project
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to create project'
    });
  }
});

/**
 * GET /api/projects/:id
 * Get project by ID with all related data
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        blueprint: true,
        story: true,
        characters: true,
        scenes: {
          include: {
            assets: true
          },
          orderBy: {
            sceneIndex: 'asc'
          }
        },
        assets: true
      }
    });

    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to retrieve project'
    });
  }
});

/**
 * GET /api/projects/user/:userId
 * Get all projects for a user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        blueprint: true,
        _count: {
          select: {
            characters: true,
            scenes: true,
            assets: true
          }
        }
      }
    });

    res.json({
      success: true,
      projects
    });
  } catch (error: any) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to retrieve projects'
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      project
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to update project'
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to delete project'
    });
  }
});

export default router;
