type SkillLevel = "unrated" | "beginner" | "novice" | "intermediate" | "advanced" | "pro";

const skillLegend: { initial: string; label: string }[] = [
  { initial: "U", label: "Unrated" },
  { initial: "B", label: "Beginner" },
  { initial: "N", label: "Novice" },
  { initial: "I", label: "Intermediate" },
  { initial: "A", label: "Advanced" },
  { initial: "P", label: "Professional" },
];

export const getSkillInitial = (level: SkillLevel) => {
  const mapping: Record<SkillLevel, string> = {
    unrated: "U",
    beginner: "B",
    novice: "N",
    intermediate: "I",
    advanced: "A",
    pro: "P",
  };
  return mapping[level];
};

export const getSkillColor = (level: SkillLevel) => {
  const colors: Record<SkillLevel, string> = {
    unrated: "#9CA3AF", // gray-400
    beginner: "#E6C229",
    novice: "#1A8FE3",
    intermediate: "#6610F2",
    advanced: "#F17105",
    pro: "#D11149",
  };
  return colors[level];
};

export function SkillLegend() {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pt-3">
      <div className="flex gap-4 min-w-max text-xs text-gray-600">
        {skillLegend.map((item) => {
          const skillLevelMapping: Record<string, SkillLevel> = {
            U: "unrated",
            B: "beginner",
            N: "novice",
            I: "intermediate",
            A: "advanced",
            P: "pro",
          };

          const skillLevel = skillLevelMapping[item.initial]!;

          return (
            <span
              key={item.initial}
              className="whitespace-nowrap text-gray-400"
            >
              <span
                className="font-semibold"
                style={{ color: getSkillColor(skillLevel) }}
              >
                {item.initial}
              </span>{" "}
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
