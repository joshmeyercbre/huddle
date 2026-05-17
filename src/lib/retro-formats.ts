import type { RetroFormat } from "@/types";

export interface FormatColumn {
  key: string;
  label: string;
  color: string;
  dot: string;
}

export interface RetroFormatConfig {
  id: RetroFormat;
  label: string;
  description: string;
  columns: FormatColumn[];
}

export const RETRO_FORMATS: RetroFormatConfig[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Went Well · Didn't Go Well · Try Next",
    columns: [
      { key: "went_well",     label: "Went Well",       color: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
      { key: "didnt_go_well", label: "Didn't Go Well",  color: "bg-rose-50 border-rose-200",       dot: "bg-rose-500"    },
      { key: "try_next",      label: "Try Next Sprint", color: "bg-amber-50 border-amber-200",     dot: "bg-amber-500"   },
    ],
  },
  {
    id: "start_stop_continue",
    label: "Start / Stop / Continue",
    description: "Start · Stop · Continue",
    columns: [
      { key: "start",    label: "Start",    color: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
      { key: "stop",     label: "Stop",     color: "bg-rose-50 border-rose-200",       dot: "bg-rose-500"    },
      { key: "continue", label: "Continue", color: "bg-blue-50 border-blue-200",       dot: "bg-blue-500"    },
    ],
  },
  {
    id: "mad_sad_glad",
    label: "Mad / Sad / Glad",
    description: "Mad · Sad · Glad",
    columns: [
      { key: "mad",  label: "Mad",  color: "bg-rose-50 border-rose-200",     dot: "bg-rose-500"    },
      { key: "sad",  label: "Sad",  color: "bg-amber-50 border-amber-200",   dot: "bg-amber-500"   },
      { key: "glad", label: "Glad", color: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    ],
  },
];

export function getFormat(id?: string): RetroFormatConfig {
  return RETRO_FORMATS.find((f) => f.id === id) ?? RETRO_FORMATS[0];
}
