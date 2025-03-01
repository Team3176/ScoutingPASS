import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ScoutingData {
  // Pre-match data
  scouterInitials: string;
  event: string;
  matchLevel: string;
  matchNumber: string;
  teamNumber: string;
  robotPosition: string;
  redPoint: { x: number; y: number } | null;
  bluePoint: { x: number; y: number } | null;
  clickedPoints: { x: number; y: number }[];

  // Autonomous data - Arrays to store sequence of button presses (1 for success, 0 for failure)
  autonCoralL1: number[];
  autonCoralL2: number[];
  autonCoralL3: number[];
  autonCoralL4: number[];
  autonProcessorScore: number[];
  autonNetScore: number[];
  mobility: number[];
  crossedLine: number[];
  coralScoredLocation: 'barge' | 'processor' | 'both' | null;
  autonScoringPositions: { x: number; y: number }[];

  // Teleop data
  teleopSpeakerScored: number;
  teleopAmpScored: number;
  teleopNotePickup: number;
  scoringCycles: number[];
  teleopCoralL1: number[];
  teleopCoralL2: number[];
  teleopCoralL3: number[];
  teleopCoralL4: number[];
  teleopProcessorScore: number[];
  teleopNetScore: number[];
  teleopAlgaeProcessor: number[];
  teleopAlgaeNet: number[];
  scoredFarSide: boolean;
  algaeRemoved: boolean;
  robotDied: boolean;
  playedDefense: boolean;
  cageHang: 'deep' | 'shallow' | 'line' | null;

  // Endgame data
  onStage: boolean;
  spotlit: boolean;
  harmony: boolean;
  trap: boolean;
  parked: 'not_attempted' | 'failed' | 'successful';
  driverSkill: 'not_attempted' | 'failed' | 'successful';
  speedRating: 'not_attempted' | 'failed' | 'successful';
  defenseRating: number;
  comments: string;
  redAllianceScore: string;
  blueAllianceScore: string;
}

export interface ScoutingContextType {
  scoutingData: ScoutingData;
  setScoutingData: React.Dispatch<React.SetStateAction<ScoutingData>>;
  updateScoutingData: (updates: Partial<ScoutingData>) => void;
}

export const defaultScoutingData: ScoutingData = {
  // Pre-match defaults
  scouterInitials: '',
  event: '',
  matchLevel: '',
  matchNumber: '',
  teamNumber: '',
  robotPosition: '',
  redPoint: null,
  bluePoint: null,
  clickedPoints: [],

  // Autonomous defaults - Initialize empty arrays for button press sequences
  autonCoralL1: [],
  autonCoralL2: [],
  autonCoralL3: [],
  autonCoralL4: [],
  autonProcessorScore: [],
  autonNetScore: [],
  mobility: [],
  crossedLine: [],
  coralScoredLocation: null,
  autonScoringPositions: [],

  // Teleop defaults
  teleopSpeakerScored: 0,
  teleopAmpScored: 0,
  teleopNotePickup: 0,
  scoringCycles: [],
  teleopCoralL1: [],
  teleopCoralL2: [],
  teleopCoralL3: [],
  teleopCoralL4: [],
  teleopProcessorScore: [],
  teleopNetScore: [],
  teleopAlgaeProcessor: [],
  teleopAlgaeNet: [],
  scoredFarSide: false,
  algaeRemoved: false,
  robotDied: false,
  playedDefense: false,
  cageHang: null,

  // Endgame defaults
  onStage: false,
  spotlit: false,
  harmony: false,
  trap: false,
  parked: 'not_attempted',
  driverSkill: 'not_attempted',
  speedRating: 'not_attempted',
  defenseRating: 0,
  comments: '',
  redAllianceScore: '',
  blueAllianceScore: '',
};

export const ScoutingContext = createContext<ScoutingContextType>({
  scoutingData: defaultScoutingData,
  setScoutingData: () => {},
  updateScoutingData: () => {},
});

export function ScoutingProvider({ children }: { children: React.ReactNode }) {
  const [scoutingData, setScoutingData] = useState<ScoutingData>(defaultScoutingData);
  const [error, setError] = useState<Error | null>(null);

  const updateScoutingData = (updates: Partial<ScoutingData>) => {
    try {
      setScoutingData(prev => ({
        ...prev,
        ...updates,
      }));
    } catch (err) {
      console.error('Error updating scouting data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // If there was an error, render children anyway but log the error
  if (error) {
    console.error('ScoutingProvider error:', error);
  }

  return (
    <ScoutingContext.Provider value={{ scoutingData, setScoutingData, updateScoutingData }}>
      {children}
    </ScoutingContext.Provider>
  );
}

export function useScoutingData() {
  const context = useContext(ScoutingContext);
  if (context === undefined) {
    console.error('useScoutingData must be used within a ScoutingProvider');
    // Return a default context instead of throwing to prevent crashes
    return {
      scoutingData: defaultScoutingData,
      setScoutingData: () => {},
      updateScoutingData: () => {},
    };
  }
  return context;
} 