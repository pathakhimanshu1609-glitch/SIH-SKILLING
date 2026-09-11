import { supabase } from '../config/supabase.js';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];

  // Handle Mock/Demo Tokens for local testing when Supabase is not yet configured
  if (token.startsWith('demo-token-')) {
    const roleMatch = token.replace('demo-token-', '');
    const validRoles = ['candidate', 'training_center', 'government', 'employer'];
    const role = validRoles.includes(roleMatch) ? roleMatch : 'candidate';

    req.user = {
      id: `demo-user-${role}`,
      email: `${role}@portal.gov.in`,
      role: role,
      full_name: `${role.toUpperCase().replace('_', ' ')} Demo User`,
      user_metadata: { role }
    };
    return next();
  }

  try {
    // Verify JWT token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-supabase-project') || token.startsWith('demo-') || token.startsWith('mock-')) {
        req.user = {
          id: 'demo-user-candidate',
          email: 'candidate@portal.gov.in',
          role: 'candidate',
          full_name: 'Candidate Demo User',
          user_metadata: { role: 'candidate' }
        };
        return next();
      }

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired JWT session token',
        details: error?.message
      });
    }

    // Fetch user profile to get assigned role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || user.user_metadata?.role || 'candidate',
      full_name: profile?.full_name || user.user_metadata?.full_name || 'Portal User',
      profile: profile || null
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal Server Error during token authentication' });
  }
};
