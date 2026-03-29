import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SportRecommendationRequestGender } from '@workspace/api-client-react';

export interface UserProfile {
  weight: number | '';
  height: number | '';
  age: number | '';
  gender: SportRecommendationRequestGender | '';
  healthIssues: string[];
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  weight: '',
  height: '',
  age: '',
  gender: '',
  healthIssues: [],
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
