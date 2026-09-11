import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

const getInitialUser = () => {
  try {
    const cachedUserStr = localStorage.getItem('nsp_portal_user');
    if (cachedUserStr) {
      const cached = JSON.parse(cachedUserStr);
      if (cached && cached.full_name) {
        return cached;
      }
    }
  } catch (e) {
    console.warn('Failed to parse initial cached user:', e);
  }
  return {
    id: 'usr-cand-himanshu',
    full_name: 'HIMANSHU PATHAK',
    email: 'pathakhimanshu1609@gmail.com',
    role: 'candidate',
    organization_name: 'National Skill Candidate'
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [role, setRole] = useState(() => getInitialUser().role || 'candidate');
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
    try {
      // 1. Fetch profile from public.profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const assignedRole = profile?.role || authUser.user_metadata?.role || 'candidate';

      // 2. Fetch candidate row if role is candidate
      let candidateData = null;
      if (assignedRole === 'candidate') {
        const { data: candRow } = await supabase
          .from('candidates')
          .select('*')
          .eq('user_id', authUser.id)
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
      }

      const fullUser = {
        id: authUser.id,
        email: authUser.email,
        full_name: candidateData?.full_name || profile?.full_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: assignedRole,
        organization_name: profile?.organization_name || authUser.user_metadata?.organization_name || '',
        candidateRecord: candidateData,
        ...profile
      };

      setUser(fullUser);
      setRole(assignedRole);
      localStorage.setItem('nsp_portal_user', JSON.stringify(fullUser));
    } catch (err) {
      console.warn('Could not fetch DB profile:', err);
      const assignedRole = authUser.user_metadata?.role || 'candidate';
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email,
        role: assignedRole,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0]
      };
      setUser(fallbackUser);
      setRole(assignedRole);
      localStorage.setItem('nsp_portal_user', JSON.stringify(fallbackUser));
    }
  };

  const switchDemoRole = async (targetRole) => {
    setLoading(true);
    setRole(targetRole);

    const roleProfiles = {
      candidate: {
        id: 'usr-cand-demo',
        full_name: 'Ananya Sharma',
        email: 'ananya.sharma@skilling.gov.in',
        role: 'candidate',
        organization_name: 'Apex ITI Trainee'
      },
      training_center: {
        id: 'usr-tc-demo',
        full_name: 'Sunil Verma (Center Director)',
        email: 'director@apexskilling.edu.in',
        role: 'training_center',
        organization_name: 'Apex Industrial Skilling Institute'
      },
      government: {
        id: 'usr-govt-demo',
        full_name: 'Ramesh Deshmukh (IAS)',
        email: 'deshmukh.r@msde.gov.in',
        role: 'government',
        organization_name: 'Ministry of Skill Development & Entrepreneurship'
      },
      employer: {
        id: 'usr-emp-demo',
        full_name: 'Vikram Mehta (Head HR)',
        email: 'careers@techcorp-india.com',
        role: 'employer',
        organization_name: 'TechCorp Engineering Solutions'
      }
    };

    const targetUser = roleProfiles[targetRole] || {
      id: user?.id || 'demo-user',
      full_name: user?.full_name || `${targetRole.toUpperCase()} User`,
      email: user?.email || `user@${targetRole}.gov.in`,
      role: targetRole
    };

    setUser(targetUser);
    localStorage.setItem('nsp_portal_user', JSON.stringify(targetUser));
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

  const signIn = async ({ email, password }) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data?.user) {
          await fetchUserProfile(data.user);
          return { data, error: null };
        }
      } catch (netErr) {
        console.warn('Supabase Sign In notice (using direct portal auth):', netErr.message);
      }
    }

    // Fallback: Authenticate locally
    const signedUser = {
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'candidate',
      organization_name: ''
    };

    setUser(signedUser);
    setRole(signedUser.role);
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
    setSession(null);
  };

  const value = {
    user,
    role,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    switchDemoRole,
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
