import { editor } from "@silverbulletmd/silverbullet/syscalls";
import { QueryProviderEvent } from "@silverbulletmd/silverbullet/types";
import { readYamlPage } from "@silverbulletmd/silverbullet/lib/yaml_page";
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

export async function queryEvents(
  { query }: QueryProviderEvent,
): Promise<any[]> {
  const secrets = await readYamlPage("SECRETS");
  const icsUrl = secrets.icsUrl;
  // TODO: Loop over multiple sources (like CalDAV, .ics URLs) and assign calendar name based on X-WR-CALNAME
  const result = await fetch(icsUrl);
  const icsData = await result.text();
  const calendarParsed: VCalendar = parseIcsCalendar(icsData);

  if (calendarParsed.events === undefined) {
    editor.flashNotification("Did not parse events from iCalendar");
    return [];
  }

  let events: Event[] = calendarParsed.events.map((ics) => {
    return {
      summary: ics.summary,
      description: ics.description,
      // Mimic properties of pages
      created: ics.created ? localDateString(ics.created.date) : undefined,
      lastModified: ics.lastModified
        ? localDateString(ics.lastModified.date)
        : undefined,
      // Consistent with formats above
      start: localDateString(ics.start.date),
      end: ics.end ? localDateString(ics.end.date) : undefined,
    };
  });

  // FIXME: Fails whenever any filters are applied, but same code works for github plug
  events = applyQuery(query, events);
  return events;
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

// didn't help
function flattenObject(obj: any, prefix = ""): any {
  let result: any = {};
  for (let [key, value] of Object.entries(obj)) {
    if (prefix) {
      key = prefix + "_" + key;
    }
    if (value && typeof value === "object") {
      result = { ...result, ...flattenObject(value, key) };
    } else {
      result[key] = value;
    }
  }
  return result;
}
