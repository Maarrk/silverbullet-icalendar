import { editor, system } from "@silverbulletmd/silverbullet/syscalls";
import { QueryProviderEvent } from "@silverbulletmd/silverbullet/types";
import { applyQuery } from "@silverbulletmd/silverbullet/lib/query";
import { parseIcsCalendar, type VCalendar } from "ts-ics";

interface Event {
  summary: string | undefined;
  description: string | undefined;
  created: string | undefined;
  lastModified: string | undefined;
  start: string | undefined;
  end: string | undefined;
}

interface Source {
  url: string;
  name: string | undefined;
}

export async function queryEvents(
  { query }: QueryProviderEvent,
): Promise<any[]> {
  const events: Event[] = [];

  const sources = await getSources();
  for (const source of sources) {
    const identifier = (source.name === undefined || source.name === "")
      ? source.url
      : source.name;

    try {
      const result = await fetch(source.url);
      const icsData = await result.text();

      const calendarParsed: VCalendar = parseIcsCalendar(icsData);
      if (calendarParsed.events === undefined) {
        throw new Error("Didn't parse events from ics data");
      }

      console.log(JSON.stringify(calendarParsed.events[0], null, 2));

      for (const icsEvent of calendarParsed.events) {
        events.push({
          summary: icsEvent.summary,
          description: icsEvent.description,
          // Mimic properties of pages
          created: icsEvent.created
            ? localDateString(icsEvent.created.date)
            : undefined,
          lastModified: icsEvent.lastModified
            ? localDateString(icsEvent.lastModified.date)
            : undefined,
          // Consistent with formats above
          start: localDateString(icsEvent.start.date),
          end: icsEvent.end ? localDateString(icsEvent.end.date) : undefined,
        });
      }
    } catch (err) {
      console.error(
        `Getting events from ${identifier} failed with:`,
        err,
      );
    }
  }
  return applyQuery(query, events, {}, {});
}

async function getSources(): Promise<Source[]> {
  const config = await system.getSpaceConfig("icalendar", {});

  if (!config.sources || !Array.isArray(config.sources)) {
    console.error("Configure icalendar.sources");
    return [];
  }

  const sources = config.sources;

  if (sources.length === 0) {
    console.error("Empty icalendar.sources");
    return [];
  }

  const validated: Source[] = [];
  for (const src of sources) {
    if (typeof src.url !== "string") {
      console.error(
        `Invalid iCalendar source`,
        src,
      );
      continue;
    }
    validated.push({
      url: src.url,
      name: (typeof src.name === "string") ? src.name : undefined,
    });
  }

  return validated;
}

// Copied from @silverbulletmd/silverbullet/lib/dates.ts which is not exported in the package
export function localDateString(d: Date): string {
  return d.getFullYear() +
    "-" + String(d.getMonth() + 1).padStart(2, "0") +
    "-" + String(d.getDate()).padStart(2, "0") +
    "T" + String(d.getHours()).padStart(2, "0") +
    ":" + String(d.getMinutes()).padStart(2, "0") +
    ":" + String(d.getSeconds()).padStart(2, "0") +
    "." + String(d.getMilliseconds()).padStart(3, "0");
}
