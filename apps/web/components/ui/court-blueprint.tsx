const NEUTRAL_TEXT = "#111827"; // slate-900

export interface Court {
  id: number;
  number: number;
  players: string[]; // up to 4; we will map [A1, A2, B1, B2]
  isOccupied: boolean;
}

export const CourtBlueprint = ({ court }: { court: Court }) => {
  const [P1 = "—", P2 = "—", P3 = "—", P4 = "—"] = court.players;
  return (
    <div className="relative aspect-[133/200] overflow-hidden rounded-lg">
      <svg viewBox="0 0 266 400" className="h-full w-full" preserveAspectRatio="xMidYMid meet" >
        {/* === Outer boundary (full doubles court) === */}
        <rect x="0" y="0" width="266" height="400" fill="rgb(209,213,219)" />

        {/* === Court lines === */}
        <line x1="16" y1="17" x2="16" y2="383" stroke="white" strokeWidth="2" />
        <line x1="38" y1="17" x2="38" y2="383" stroke="white" strokeWidth="2" />
        <line x1="228" y1="17" x2="228" y2="383" stroke="white" strokeWidth="2" />
        <line x1="250" y1="17" x2="250" y2="383" stroke="white" strokeWidth="2" />
        <line x1="16" y1="17" x2="250" y2="17" stroke="white" strokeWidth="2" />
        <line x1="16" y1="383" x2="250" y2="383" stroke="white" strokeWidth="2" />
        <line x1="16" y1="39" x2="250" y2="39" stroke="white" strokeWidth="2" />
        <line x1="16" y1="361" x2="250" y2="361" stroke="white" strokeWidth="2" />
        <line x1="16" y1="144" x2="250" y2="144" stroke="white" strokeWidth="2" />
        <line x1="16" y1="256" x2="250" y2="256" stroke="white" strokeWidth="2" />
        <line x1="133" y1="17" x2="133" y2="144" stroke="white" strokeWidth="2" />
        <line x1="133" y1="256" x2="133" y2="383" stroke="white" strokeWidth="2" />

        {/* === Net line (striped, centered across court) === */}
        <line x1="16" y1="200" x2="250" y2="200" stroke="white" strokeWidth="1" strokeDasharray="4 6" strokeLinecap="round" />

        {/* === Split each singles box into two equal columns (within 55–245) === */}
        <line x1="133" y1="39" x2="133" y2="144" stroke="white" strokeWidth="2" />
        <line x1="133" y1="256" x2="133" y2="361" stroke="white" strokeWidth="2" />

        {/* === Names (auto-wrap to two lines if multi-syllable) === */}
        {/* top left / top right */}
        <NameLabel x={85} y={92} name={P1} fill="#1E3A8A" opacity={0.6} />
        <NameLabel x={181} y={92} name={P2} fill="#9D174D" opacity={0.6} />
        {/* bottom left / bottom right */}
        <NameLabel x={85} y={309} name={P3} fill="#9D174D" opacity={0.6} />
        <NameLabel x={181} y={309} name={P4} fill="#1E3A8A" opacity={0.6} />

        {/* Court number */}
        <text
          x="133"
          y="215"
          textAnchor="middle"
          fill="white"
          fontSize="48"
          fontWeight="bold"
          opacity="1"
        >
          {court.number}
        </text>
      </svg>
    </div>
  );
};

function NameLabel({
  x,
  y,
  name,
  fill = NEUTRAL_TEXT,
  opacity = 0.85,
  lineHeight = 18,
  fontSize = 14,
  weight = "bold",
}: {
  x: number;
  y: number;
  name: string;
  fill?: string;
  opacity?: number;
  lineHeight?: number;
  fontSize?: number;
  weight?: string | number;
}) {
  const [line1, line2] = splitIntoTwoLines(name || "");
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={fill}
      fontSize={fontSize}
      fontWeight={weight}
      opacity={opacity}
    >
      <tspan x={x} dy={0}>
        {line1}
      </tspan>
      {line2 ? (
        <tspan x={x} dy={lineHeight}>
          {line2}
        </tspan>
      ) : null}
    </text>
  );
}

function splitIntoTwoLines(name: string): [string, string] {
  const tokens = tokenizeName(name || "");
  if (tokens.length <= 1) return [name || "", ""]; // single token stays on one line
  if (tokens.length === 2) return [tokens[0], tokens[1]];

  const sylls = tokens.map(countSyllables);
  const total = sylls.reduce((a, b) => a + b, 0);
  let best = { idx: 1, diff: Infinity };
  for (let i = 1; i < tokens.length; i++) {
    const left = sylls.slice(0, i).reduce((a, b) => a + b, 0);
    const right = total - left;
    const diff = Math.abs(left - right);
    if (diff < best.diff) best = { idx: i, diff };
  }
  return [
    tokens.slice(0, best.idx).join(" "),
    tokens.slice(best.idx).join(" "),
  ];
}

function countSyllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = (w.match(/[aeiouy]+/g) || []).length;
  const silentE = /e$/.test(w) ? -1 : 0;
  const adjust = ["le", "les", "ted", "ded"].some((s) => w.endsWith(s)) ? 1 : 0;
  const raw = groups + silentE + adjust;
  return Math.max(1, raw);
}

function tokenizeName(name: string) {
  return String(name)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s\-_]+/)
    .filter(Boolean);
}
