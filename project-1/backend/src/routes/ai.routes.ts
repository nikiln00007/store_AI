import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/command', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid text or voice command prompt.' });
    }

    const aiResponse = await AIService.processCommand(prompt, req.user);
    return res.json({ success: true, aiResponse });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
