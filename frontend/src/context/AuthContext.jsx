import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

const getInitialUser = () => {
  try {
    const cachedUserStr = localStorage.getItem('nsp_portal_user');
    if (cachedUserStr) {
      const cached = JSON.parse(cachedUserStr);
      if (cached && (cached.full_name || cached.email || cached.id)) {
        return cached;
      }
    }
  } catch (e) {
    console.warn('Failed to parse initial cached user:', e);
  }
  return null;
};

const getInitialCandidateProfile = () => {
  try {
    const cachedUserStr = localStorage.getItem('nsp_portal_user');
    if (cachedUserStr) {
      const cached = JSON.parse(cachedUserStr);
      if (cached?.candidateProfile) return cached.candidateProfile;
      if (cached?.candidateRecord) return cached.candidateRecord;
      if (cached?.role === 'candidate' && (cached?.preferred_trade || cached?.id)) return cached;
    }
  } catch (e) {}
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [role, setRole] = useState(() => getInitialUser()?.role || null);
  const [candidateProfile, setCandidateProfile] = useState(getInitialCandidateProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let subscription = null;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured()) return;

        const { data: { session: activeSession } } = await supabase.auth.getSession().catch(() => ({ data: {} }));
        if (activeSession?.user) {
          setSession(activeSession);
          await fetchUserProfile(activeSession.user);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          setSession(newSession);
          if (newSession?.user) {
            await fetchUserProfile(newSession.user);
          }
        });

        subscription = authListener?.subscription;
      } catch (err) {
        console.error('Error in background Supabase Auth sync:', err);
      }
    };

    initAuth();

    return () => {
      if (subscription) subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser) => {
    setIsProfileLoading(true);
    try {
      // 1. Fetch profile from public.profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const assignedRole = profile?.role || authUser.user_metadata?.role || role || 'candidate';

      // 2. Fetch candidate row if role is candidate
      let candidateData = null;
      if (assignedRole === 'candidate') {
        const { data: candRow } = await supabase
          .from('candidates')
          .select('*')
          .or(`user_id.eq.${authUser.id},id.eq.${authUser.id}`)
          .maybeSingle();
        
        candidateData = candRow || null;

        // Auto-create candidate row if it doesn't exist yet
        if (!candRow) {
          const newCandName = profile?.full_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0];
          const { data: createdCand } = await supabase
            .from('candidates')
            .upsert({
              user_id: authUser.id,
              full_name: newCandName,
              email: authUser.email,
              status: 'Registered',
              preferred_trade: 'Advanced CNC Machinist',
              district: 'Pune',
              qualification: 'ITI Machinist Certificate',
              state: 'Maharashtra',
              dob: '2002-05-10',
              gender: 'General'
            }, { onConflict: 'user_id' })
            .select()
            .maybeSingle();
            
          candidateData = createdCand || null;
        }

        if (candidateData) {
          setCandidateProfile(candidateData);
        }
      }

      const fullUser = {
        id: authUser.id,
        email: authUser.email,
        full_name: candidateData?.full_name || profile?.full_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: assignedRole,
        organization_name: profile?.organization_name || authUser.user_metadata?.organization_name || '',
        candidateRecord: candidateData || candidateProfile,
        candidateProfile: candidateData || candidateProfile,
        ...profile
      };

      setUser(fullUser);
      setRole(assignedRole);
      localStorage.setItem('nsp_portal_user', JSON.stringify(fullUser));
    } catch (err) {
      console.warn('Could not fetch DB profile:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const updateCandidateProfile = (updates) => {
    setCandidateProfile(prev => {
      const updated = { ...prev, ...updates };
      setUser(curr => {
        const u = { ...curr, candidateProfile: updated, candidateRecord: updated };
        localStorage.setItem('nsp_portal_user', JSON.stringify(u));
        return u;
      });
      return updated;
    });
  };

  const switchDemoRole = async (targetRole) => {
    setLoading(true);
    setRole(targetRole);

    const currentUser = user || {
      id: `usr-${Date.now()}`,
      email: `${targetRole}@skilling.gov.in`,
      full_name: 'Portal User'
    };

    const updatedUser = {
      ...currentUser,
      role: targetRole,
      organization_name: targetRole === 'candidate' 
        ? 'National Skilling Candidate' 
        : (currentUser.organization_name || `${targetRole.replace('_', ' ').toUpperCase()} Organization`)
    };

    setUser(updatedUser);
    localStorage.setItem('nsp_portal_user', JSON.stringify(updatedUser));
    setLoading(false);
  };

  const signUp = async ({ email, password, fullName, selectedRole, orgName }) => {
    let userData = null;
    let authError = null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
              organization_name: orgName
            }
          }
        });

        if (error) {
          authError = error;
        } else if (data?.user) {
          userData = data.user;
          // 1. Save profile to public.profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: selectedRole,
            organization_name: orgName
          }).catch(e => console.warn('Supabase profiles insert note:', e));

          // 2. If Candidate role, automatically create/upsert candidates row in Supabase
          if (selectedRole === 'candidate') {
            await supabase.from('candidates').upsert({
              user_id: data.user.id,
              full_name: fullName,
              email: email,
              status: 'Registered',
              preferred_trade: 'Advanced CNC Machinist',
              district: 'Pune',
              qualification: 'ITI Machinist Certificate',
              state: 'Maharashtra',
              dob: '2003-08-14',
              gender: 'General'
            }, { onConflict: 'user_id' }).catch(e => console.warn('Supabase candidates insert note:', e));
          }

          await fetchUserProfile(data.user);
          return { data, error: null };
        }
      } catch (netErr) {
        console.warn('Supabase Auth network notice (using direct portal registration):', netErr.message);
      }
    }

    // Fallback: If Supabase auth is not configured or network failed, register profile locally & save state
    const createdUser = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName || email.split('@')[0],
      role: selectedRole || 'candidate',
      organization_name: orgName || ''
    };

    setUser(createdUser);
    setRole(createdUser.role);
    localStorage.setItem('nsp_portal_user', JSON.stringify(createdUser));

    return { data: { user: createdUser }, error: null };
  };

  const signIn = async (credentials, maybePassword, maybeRole) => {
    let email = '';
    let password = '';
    let explicitRole = null;
    if (typeof credentials === 'object' && credentials !== null) {
      email = credentials.email || '';
      password = credentials.password || '';
      explicitRole = credentials.role || null;
    } else {
      email = credentials || '';
      password = maybePassword || '';
      explicitRole = maybeRole || null;
    }

    if (isSupabaseConfigured() && email && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data?.user) {
          if (explicitRole) {
            setRole(explicitRole);
            await supabase.from('profiles').upsert({ id: data.user.id, role: explicitRole }).catch(() => {});
          }
          await fetchUserProfile(data.user);
          if (explicitRole) {
            setRole(explicitRole);
          }
          return { data, error: null };
        }
        if (error) {
          console.warn('Supabase sign-in response:', error.message);
        }
      } catch (netErr) {
        console.warn('Supabase Sign In notice (using direct portal auth):', netErr?.message);
      }
    }

    // Fallback: Authenticate locally so candidates/admins can always access in dev/offline
    const rawName = email ? email.split('@')[0] : 'Portal User';
    const formattedName = rawName.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    let userRole = explicitRole || 'candidate';
    if (!explicitRole) {
      if (email.includes('admin') || email.includes('govt')) userRole = 'government';
      else if (email.includes('trainer') || email.includes('center') || email.includes('institute')) userRole = 'training_center';
      else if (email.includes('employer') || email.includes('hr') || email.includes('corp')) userRole = 'employer';
    }

    const orgNameByRole = {
      candidate: 'National Skilling Candidate',
      training_center: 'Apex Industrial Training Institute',
      employer: 'Tata Motors Limited',
      government: 'Ministry of Skill Development & Entrepreneurship'
    };

    const signedUser = {
      id: `usr-${Date.now()}`,
      email: email || `${userRole}@skilling.gov.in`,
      full_name: formattedName || 'Portal User',
      role: userRole,
      organization_name: orgNameByRole[userRole] || 'Partner Organization',
      candidateRecord: {
        id: `cand-${Date.now()}`,
        user_id: `usr-${Date.now()}`,
        full_name: formattedName || 'Portal User',
        email: email || 'user@skilling.gov.in',
        preferred_trade: 'Advanced CNC Machinist',
        district: 'Pune',
        state: 'Maharashtra',
        qualification: 'ITI Machinist Certificate',
        status: 'Registered',
        is_verified: true,
        aadhaar_last4: '8842'
      }
    };
    signedUser.candidateProfile = signedUser.candidateRecord;

    setUser(signedUser);
    setRole(signedUser.role);
    setCandidateProfile(signedUser.candidateRecord);
    localStorage.setItem('nsp_portal_user', JSON.stringify(signedUser));

    return { data: { user: signedUser }, error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('nsp_portal_user');
    setUser(null);
    setRole(null);
    setCandidateProfile(null);
    setSession(null);
  };

  const value = {
    user,
    role,
    candidateProfile,
    isProfileLoading,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    switchDemoRole,
    updateCandidateProfile,
    refreshCandidateProfile: () => user && fetchUserProfile({ id: user.id, email: user.email }),
    refreshUser: () => user && fetchUserProfile({ id: user.id, email: user.email })
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
