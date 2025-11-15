'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedProfile {
  userId: string;
  userName: string;
  userPhoto?: string;
}

interface ProfileActionContextType {
  selectedProfile: SelectedProfile | null;
  setSelectedProfile: (profile: SelectedProfile | null) => void;
  clearSelectedProfile: () => void;
}

const ProfileActionContext = createContext<ProfileActionContextType | undefined>(undefined);

export function ProfileActionProvider({ children }: { children: ReactNode }) {
  const [selectedProfile, setSelectedProfileState] = useState<SelectedProfile | null>(null);

  const setSelectedProfile = (profile: SelectedProfile | null) => {
    setSelectedProfileState(profile);
  };

  const clearSelectedProfile = () => {
    setSelectedProfileState(null);
  };

  return (
    <ProfileActionContext.Provider
      value={{
        selectedProfile,
        setSelectedProfile,
        clearSelectedProfile,
      }}
    >
      {children}
    </ProfileActionContext.Provider>
  );
}

export function useProfileAction() {
  const context = useContext(ProfileActionContext);
  if (!context) {
    throw new Error('useProfileAction must be used within ProfileActionProvider');
  }
  return context;
}

