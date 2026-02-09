import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Volume2, List, Hash, Music } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const PRESET_BACKGROUNDS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Purple/Blue
  "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)", // Green/Teal
  "linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)", // Pinkish
  "linear-gradient(120deg, #f6d365 0%, #fda085 100%)", // Orange/Yellow
  "url('https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop')", // Party
  "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')", // Gradient Abstract
];

const PRESET_MUSIC = [
  { name: "Vui vẻ (Fun)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Sôi động (Energetic)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { name: "Nhẹ nhàng (Calm)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [priorityInput, setPriorityInput] = useState(settings.priorityList.join(', '));

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setPriorityInput(settings.priorityList.join(', '));
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    // Parse priority list
    const parsedPriority = priorityInput
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));

    onSave({
      ...localSettings,
      priorityList: parsedPriority
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Cài Đặt (Settings)
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Range Settings */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Khoảng Số (Range)</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Từ (From)</label>
                <input
                  type="number"
                  value={localSettings.min}
                  onChange={(e) => setLocalSettings({ ...localSettings, min: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Đến (To)</label>
                <input
                  type="number"
                  value={localSettings.max}
                  onChange={(e) => setLocalSettings({ ...localSettings, max: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Priority List */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <List className="w-4 h-4" />
              Danh sách ưu tiên (Priority List)
            </label>
            <textarea
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              placeholder="VD: 10, 25, 99 (Các số này sẽ được quay trước)"
              className="w-full p-3 border border-gray-300 rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500">Nhập các số cách nhau bởi dấu phẩy. Các số này sẽ được chọn trước khi quay ngẫu nhiên.</p>
          </div>

          {/* Audio & Music */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Âm Lượng (Volume)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={localSettings.volume}
                  onChange={(e) => setLocalSettings({...localSettings, volume: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-mono w-12 text-right">{Math.round(localSettings.volume * 100)}%</span>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4" />
                Nhạc Nền (Background Music)
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_MUSIC.map((track, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLocalSettings({ ...localSettings, backgroundMusicUrl: track.url })}
                    className={`text-xs px-3 py-1 rounded-full border ${localSettings.backgroundMusicUrl === track.url ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {track.name}
                  </button>
                ))}
              </div>

              <input 
                  type="text" 
                  placeholder="Link nhạc MP3 (https://...)" 
                  value={localSettings.backgroundMusicUrl} 
                  onChange={(e) => setLocalSettings({...localSettings, backgroundMusicUrl: e.target.value})}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
               <p className="text-xs text-gray-500">Dán link file mp3 trực tiếp hoặc chọn nhạc mẫu.</p>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Hình Nền (Background)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_BACKGROUNDS.map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => setLocalSettings({ ...localSettings, backgroundImage: bg })}
                  className={`h-12 rounded-lg border-2 overflow-hidden relative ${localSettings.backgroundImage === bg ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent'}`}
                  style={{ background: bg.startsWith('url') ? bg : bg, backgroundSize: 'cover' }}
                />
              ))}
            </div>
            <input 
                type="text" 
                placeholder="Custom Image URL..." 
                value={localSettings.backgroundImage.startsWith('url') ? localSettings.backgroundImage.slice(5, -2) : ''} 
                onChange={(e) => {
                    const val = e.target.value;
                    setLocalSettings({...localSettings, backgroundImage: val ? `url('${val}')` : PRESET_BACKGROUNDS[0]})
                }}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Hủy
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30">
            <Save className="w-4 h-4" />
            Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};