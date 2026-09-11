import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Returns the currently authenticated user details & role
 */
router.get('/me', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * GET /api/auth/roles
 * Returns valid portal roles and metadata
 */
router.get('/roles', (req, res) => {
  res.json({
    roles: [
      { id: 'candidate', name: 'Candidate / Trainee', description: 'Access training programs, skill certificates, and job applications' },
      { id: 'training_center', name: 'Training Center Provider', description: 'Manage training batches, candidate attendance, and course audits' },
      { id: 'government', name: 'Government Admin / Official', description: 'Monitor national skilling metrics, fund allocations, and compliance reports' },
      { id: 'employer', name: 'Employer / Recruiter', description: 'Post skill-based vacancies and recruit certified candidates' }
    ]
  });
});

export default router;
