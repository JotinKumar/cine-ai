import { Router, Request, Response } from 'express';
import { Stage3Service } from '../services/stage3.service';
import { getModelAdapter } from '../adapters/adapter.factory';

const router = Router();

// Generate scenes for a project
router.post('/scene-generation', async (req: Request, res: Response) => {
  try {
    const { projectId, customPrompt } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const adapter = getModelAdapter('openrouter/default');
    const service = new Stage3Service(adapter);

    const result = await service.generateScenes(projectId, customPrompt);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scene generation failed';
    return res.status(500).json({ error: message });
  }
});

// Get generated scenes for a project
router.get('/scenes/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const adapter = getModelAdapter('openrouter/default');
    const service = new Stage3Service(adapter);

    // Fetch scenes from database (you'll need to implement this in the service)
    // For now, return a success message
    return res.json({
      success: true,
      message: 'Scenes retrieved',
      projectId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve scenes';
    return res.status(500).json({ error: message });
  }
});

// Regenerate a specific scene's shot blueprint
router.post('/regenerate-scene', async (req: Request, res: Response) => {
  try {
    const { projectId, sceneIndex, customPrompt } = req.body;

    if (!projectId || sceneIndex === undefined) {
      return res.status(400).json({ error: 'projectId and sceneIndex are required' });
    }

    const adapter = getModelAdapter('openrouter/default');
    const service = new Stage3Service(adapter);

    const shotBlueprint = await service.regenerateSceneBlueprint(projectId, sceneIndex, customPrompt);

    return res.json({
      success: true,
      scene: shotBlueprint,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scene regeneration failed';
    return res.status(500).json({ error: message });
  }
});

// Lock a scene
router.post('/lock-scene', async (req: Request, res: Response) => {
  try {
    const { projectId, sceneIndex } = req.body;

    if (!projectId || sceneIndex === undefined) {
      return res.status(400).json({ error: 'projectId and sceneIndex are required' });
    }

    const adapter = getModelAdapter('openrouter/default');
    const service = new Stage3Service(adapter);

    await service.lockScene(projectId, sceneIndex);

    return res.json({
      success: true,
      message: 'Scene locked',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lock scene';
    return res.status(500).json({ error: message });
  }
});

// Unlock a scene
router.post('/unlock-scene', async (req: Request, res: Response) => {
  try {
    const { projectId, sceneIndex } = req.body;

    if (!projectId || sceneIndex === undefined) {
      return res.status(400).json({ error: 'projectId and sceneIndex are required' });
    }

    const adapter = getModelAdapter('openrouter/default');
    const service = new Stage3Service(adapter);

    await service.unlockScene(projectId, sceneIndex);

    return res.json({
      success: true,
      message: 'Scene unlocked',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock scene';
    return res.status(500).json({ error: message });
  }
});

export default router;
