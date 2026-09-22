import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeddingStory } from '../types';

export const StoryReels: React.FC = () => {
  const { stories, setActiveStory, setActiveModal } = useApp();

  return (
    <div className="w-full py-4 border border-slate-200 overflow-hidden bg-white rounded-3xl p-4 shadow-xs mb-4 text-slate-900">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9f2089]" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
            Curator Looks & Fashion Reels
          </h3>
        </div>
        <span className="text-xs text-[#9f2089] font-bold cursor-pointer hover:underline">
          Trending Reels ⚡
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1 px-1">
        
        {/* User's Add Story / Look button */}
        <div 
          onClick={() => setActiveModal('upload')}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
          id="add-story-btn"
        >
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-pink-300 bg-pink-50 flex items-center justify-center p-1 group-hover:border-[#9f2089] transition-all">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#9f2089] shadow-xs">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-600 max-w-[68px] truncate text-center group-hover:text-[#9f2089]">
            Your Look
          </span>
        </div>

        {/* Stories list */}
        {stories.map((story: WeddingStory) => (
          <div
            key={story.id}
            onClick={() => {
              setActiveStory(story);
              setActiveModal('story_viewer');
            }}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
            id={`story-reel-${story.id}`}
          >
            {/* Story Ring with Gradient */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-[#9f2089] via-[#c2185b] to-pink-400 group-hover:scale-105 transition-transform shadow-xs">
              <div className="w-full h-full rounded-full p-[2px] bg-white">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-700 max-w-[72px] truncate text-center group-hover:text-[#9f2089]">
              {story.title}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
};
