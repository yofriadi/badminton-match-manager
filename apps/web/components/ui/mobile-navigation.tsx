'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Home, Briefcase, Calendar, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'schedule', icon: Home },
  { label: 'hall', icon: Briefcase },
  { label: 'history', icon: Calendar },
  { label: 'setting', icon: Settings },
];

export const MobileNavigation: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor = '#3b82f6'
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      return defaultItems;
    }
    return items;
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const matchedIndex = finalItems.findIndex((item) => {
      const slug = item.label.trim().toLowerCase();
      if (!slug) {
        return false;
      }

      const targetPath = `/${slug}`;

      if (slug === 'schedule') {
        return pathname === '/schedule' || pathname === '/';
      }

      return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
    });

    if (matchedIndex !== -1 && matchedIndex !== activeIndex) {
      setActiveIndex(matchedIndex);
    }
  }, [pathname, finalItems, activeIndex]);

  useEffect(() => {
    if (activeIndex >= finalItems.length) {
      setActiveIndex(0);
    }
  }, [finalItems, activeIndex]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    const item = finalItems[index];
    if (!item) return;

    // Navigate to the corresponding page
    const slug = item.label.trim().toLowerCase();
    if (!slug.length) {
      return;
    }

    if (slug === 'schedule') {
      router.push('/schedule');
      return;
    }

    router.push(`/${slug}`);
  };

  return (
    <nav 
      className="bg-white rounded-full shadow-sm px-4 py-2 relative"
      role="navigation"
    >
      <div className="flex items-center justify-between gap-1">
        {finalItems.map((item, index) => {
          const isActive = index === activeIndex;
          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => handleItemClick(index)}
              className="relative flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ease-out"
              style={{
                color: isActive ? '#000' : '#9ca3af'
              }}
            >
              {/* Icon */}
              <IconComponent 
                className="w-7 h-7" 
                strokeWidth={2}
              />

              {/* Text - only shown when active */}
              <span
                className={`text-base font-semibold whitespace-nowrap transition-all duration-300 ease-out ${
                  isActive ? 'max-w-24 opacity-100' : 'max-w-0 opacity-0 overflow-hidden'
                }`}
              >
                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
