
import React from 'react';
import { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  return (
    <div 
      className="group relative glass rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-slate-800 hover:border-blue-500/50"
      onClick={() => onSelect(video)}
    >
      <div className="aspect-[9/16] relative overflow-hidden bg-slate-900">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="fa-solid fa-circle-play text-4xl text-white"></i>
        </div>
        {video.isExclusiveSold && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
            Exclusivo (Vendido)
          </div>
        )}
        {video.isPublic && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">
            Grátis
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-900/80 backdrop-blur-sm absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-semibold text-slate-100 mb-1 truncate text-sm">{video.title}</h3>
        
        <div className="flex items-center justify-between mt-2">
          {video.isPublic ? (
            <div className="text-emerald-400 font-black text-xs uppercase tracking-widest">
              Download Grátis
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-400 font-bold text-xs">
              <i className="fa-solid fa-coins text-[10px]"></i>
              <span>{video.creditsCommon}</span>
            </div>
          )}
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded transition-colors">
            Detalhes
          </button>
        </div>
      </div>
      
      {/* Fallback info for non-hover on mobile */}
      <div className="p-3 sm:hidden">
        <h3 className="font-semibold text-slate-100 text-sm truncate">{video.title}</h3>
        <div className="flex justify-between items-center mt-1">
          {video.isPublic ? (
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Grátis</span>
          ) : (
            <span className="text-[10px] text-blue-400 font-bold">{video.creditsCommon} créditos</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
