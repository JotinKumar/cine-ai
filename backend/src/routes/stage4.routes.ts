import { Router, Request, Response } from 'express';
import { Stage4Service } from '../services/stage4.service';
import { getModelAdapter } from '../adapters/adapter.factory';

const router = Router();

// Generate images for all scenes in a project
router.post('/generate-images', async (req: Request, res: Response) => {
  try {
    const { projectId, useSeeds = true, customPrompt } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    const result = await service.generateImages(projectId, useSeeds, customPrompt);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return res.status(500).json({ error: message });
  }
});

// Assemble image prompt for a scene (without generation)
router.post('/assemble-prompt', async (req: Request, res: Response) => {
  try {
    const { projectId, sceneId } = req.body;

    if (!projectId || !sceneId) {
      return res.status(400).json({ error: 'projectId and sceneId are required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    // You'll need to fetch the scene and characters from database
    return res.json({
      success: true,
      message: 'Prompt assembled',
      projectId,
      sceneId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Prompt assembly failed';
    return res.status(500).json({ error: message });
  }
});

// Regenerate image for a specific scene
router.post('/regenerate-image', async (req: Request, res: Response) => {
  try {
    const { projectId, sceneId } = req.body;

    if (!projectId || !sceneId) {
      return res.status(400).json({ error: 'projectId and sceneId are required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    const imageUrl = await service.regenerateSceneImage(projectId, sceneId);

    return res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image regeneration failed';
    return res.status(500).json({ error: message });
  }
});

// Lock an asset
router.post('/lock-asset', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.body;

    if (!assetId) {
      return res.status(400).json({ error: 'assetId is required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    await service.lockAsset(assetId);

    return res.json({
      success: true,
      message: 'Asset locked',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lock asset';
    return res.status(500).json({ error: message });
  }
});

// Unlock an asset
router.post('/unlock-asset', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.body;

    if (!assetId) {
      return res.status(400).json({ error: 'assetId is required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    await service.unlockAsset(assetId);

    return res.json({
      success: true,
      message: 'Asset unlocked',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock asset';
    return res.status(500).json({ error: message });
  }
});

// Get all assets for a project
router.get('/assets/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    const assets = await service.getProjectAssets(projectId);

    return res.json({
      success: true,
      assets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve assets';
    return res.status(500).json({ error: message });
  }
});

// Delete an asset
router.delete('/asset/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;

    if (!assetId) {
      return res.status(400).json({ error: 'assetId is required' });
    }

    const imageLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage4Service(imageLlmAdapter, falaiAdapter);

    await service.deleteAsset(assetId);

    return res.json({
      success: true,
      message: 'Asset deleted',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete asset';
    return res.status(500).json({ error: message });
  }
});

export default router;
