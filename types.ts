export interface AppSettings {
  min: number;
  max: number;
  priorityList: number[];
  backgroundImage: string;
  backgroundMusicUrl: string;
  volume: number;
}

export interface DrawHistoryItem {
  number: number;
  timestamp: number;
}