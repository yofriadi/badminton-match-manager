"use client";

import React, { useMemo } from "react";
import { Home, Briefcase, Calendar, Settings } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";

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
  { label: "schedule", icon: Home },
  { label: "halls", icon: Briefcase },
  { label: "history", icon: Calendar },
  { label: "settings", icon: Settings },
];

export const MobileNavigation: React.FC<InteractiveMenuProps> = ({ items }) => {
  const navigate = useNavigate();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const finalItems = useMemo(() => {
    const isValid =
      items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      return defaultItems;
    }
    return items;
  }, [items]);

  const activeIndex = useMemo(() => {
    if (!pathname) {
      return 0;
    }

    const matchedIndex = finalItems.findIndex((item) => {
      const slug = item.label.trim().toLowerCase();
      if (!slug) {
        return false;
      }

      const targetPath = `/${slug}`;

      if (slug === "schedule") {
        return pathname === "/schedules" || pathname === "/";
      }

      return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
    });

    return matchedIndex === -1 ? 0 : matchedIndex;
  }, [pathname, finalItems]);

  const handleItemClick = (index: number) => {
    const item = finalItems[index];

    if (!item) {
      return;
    }

    // Navigate to the corresponding page
    const slug = item.label.trim().toLowerCase();
    if (!slug.length) {
      return;
    }

    if (slug === "schedule") {
      navigate({ to: "/schedules" });
      return;
    }

    navigate({ to: `/${slug}` as never });
  };

  return (
    <nav className="bg-white rounded-full shadow-sm px-4 py-2 relative">
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
                color: isActive ? "#000" : "#9ca3af",
              }}
            >
              {/* Icon */}
              <IconComponent className="w-7 h-7" strokeWidth={2} />

              {/* Text - only shown when active */}
              <span
                className={`text-base font-semibold whitespace-nowrap transition-all duration-300 ease-out ${
                  isActive
                    ? "max-w-24 opacity-100"
                    : "max-w-0 opacity-0 overflow-hidden"
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
