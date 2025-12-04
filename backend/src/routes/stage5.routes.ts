import { Router, Request, Response } from 'express';
import { Stage5Service } from '../services/stage5.service';
import { getModelAdapter } from '../adapters/adapter.factory';

const router = Router();

// Generate full video with motion cues
router.post('/generate-video', async (req: Request, res: Response) => {
  try {
    const { projectId, withAudio = true } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const videoLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage5Service(videoLlmAdapter, falaiAdapter);

    const result = await service.generateVideo(projectId, withAudio);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Video generation failed';
    return res.status(500).json({ error: message });
  }
});

// Generate audio narration
router.post('/generate-audio', async (req: Request, res: Response) => {
  try {
    const { projectId, narrationStyle = 'neutral' } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const videoLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage5Service(videoLlmAdapter, falaiAdapter);

    const result = await service.generateAudio(projectId, narrationStyle);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Audio generation failed';
    return res.status(500).json({ error: message });
  }
});

// Get video generation job status
router.get('/video-status/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const videoLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage5Service(videoLlmAdapter, falaiAdapter);

    const status = await service.getVideoJobStatus(projectId);

    return res.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get video status';
    return res.status(500).json({ error: message });
  }
});

// Cancel video generation
router.post('/cancel-video', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const videoLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage5Service(videoLlmAdapter, falaiAdapter);

    await service.cancelVideoGeneration(projectId);

    return res.json({
      success: true,
      message: 'Video generation cancelled',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel video';
    return res.status(500).json({ error: message });
  }
});

// Export video
router.post('/export-video', async (req: Request, res: Response) => {
  try {
    const { projectId, format = 'mp4', quality = '1080p' } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const videoLlmAdapter = getModelAdapter('openrouter/default');
    const falaiAdapter = getModelAdapter('falai');
    const service = new Stage5Service(videoLlmAdapter, falaiAdapter);

    const result = await service.exportVideo(projectId, format, quality);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export video';
    return res.status(500).json({ error: message });
  }
});

export default router;
