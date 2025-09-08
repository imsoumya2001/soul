'use client';
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Liquid } from '@/components/ui/button-1';

// Red color scheme instead of blue
const COLORS = {
  color1: '#FFFFFF',
  color2: '#C51E10', // Red equivalent of blue
  color3: '#E28989', // Light red
  color4: '#FEFCFC',
  color5: '#FDF9F9',
  color6: '#E7B2B8', // Pink-red
  color7: '#CB0E2D', // Deep red
  color8: '#E90017', // Bright red
  color9: '#EF4347', // Coral red
  color10: '#F47D7B', // Light coral
  color11: '#FC0B06', // Pure red
  color12: '#EAC5C1', // Very light pink
  color13: '#DE0314', // Dark red
  color14: '#F6B6BA', // Light pink
  color15: '#EBC1BE', // Beige pink
  color16: '#CB0E29', // Crimson
  color17: '#C03F4C', // Burgundy
};

const DownloadExtensionButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="flex justify-center">
      <div className="relative inline-block w-56 sm:w-64 h-12 sm:h-14 mx-auto group dark:bg-black bg-white dark:border-white border-black border-2 rounded-lg">
        <div className="absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 filter blur-[19px] opacity-70">
          <span className="absolute inset-0 rounded-lg bg-[#d9d9d9] filter blur-[6.5px]"></span>
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <Liquid isHovered={isHovered} colors={COLORS} />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-lg bg-[#010128] filter blur-[7.3px]"></div>
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <span className="absolute inset-0 rounded-lg bg-[#d9d9d9]"></span>
          <span className="absolute inset-0 rounded-lg bg-black"></span>
          <Liquid isHovered={isHovered} colors={COLORS} />
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`absolute inset-0 rounded-lg border-solid border-[3px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${
                i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[4px]'
              }`}
            ></span>
          ))}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-lg filter blur-[15px] bg-[#600006]"></span>
        </div>
        <button
          className="absolute inset-0 rounded-lg bg-transparent cursor-pointer flex items-center justify-center"
          aria-label="Download Extension"
          type="button"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="flex items-center justify-center px-3 sm:px-4 py-2 gap-2 rounded-lg group-hover:text-yellow-400 text-white text-xs sm:text-sm font-semibold tracking-wide max-w-full">
            <Download className="group-hover:fill-yellow-400 fill-white w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">DOWNLOAD EXTENSION</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default DownloadExtensionButton;