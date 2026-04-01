import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SportRecommendationRequestGender } from '@workspace/api-client-react';

export interface UserProfile {
  weight: number | '';
  height: number | '';
  age: number | '';
  gender: SportRecommendationRequestGender | '';
  healthIssues: string[];
  targetWeight: number | '';
  isTraining: boolean;
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
  targetWeight: '',
  isTraining: false,
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

/** Calculate ideal target weight range for a normal BMI (18.5–24.9) */
export function calcTargetWeight(heightCm: number): { min: number; max: number; ideal: number } {
  const h = heightCm / 100;
  return {
    min: Math.round(18.5 * h * h * 10) / 10,
    max: Math.round(24.9 * h * h * 10) / 10,
    ideal: Math.round(22.0 * h * h * 10) / 10,
  };
}
