import { editor } from "@silverbulletmd/silverbullet/syscalls";
import { QueryProviderEvent } from "@silverbulletmd/silverbullet/types";
import { readYamlPage } from "@silverbulletmd/silverbullet/lib/yaml_page";
import { applyQuery } from "@silverbulletmd/silverbullet/lib/query";
import { parseIcsCalendar, type VCalendar } from "ts-ics";

interface Event {
  summary: string | undefined;
  description: string | undefined;
}

export async function queryIcs({ query }: QueryProviderEvent): Promise<any[]> {
  const secrets = await readYamlPage("SECRETS");
  const icsUrl = secrets.icsUrl;
  const result = await fetch(icsUrl);
  const icsData = await result.text();
  const calendarParsed: VCalendar = parseIcsCalendar(icsData);
  // TODO: Loop over multiple .ics URLs and assign calendar name based on X-WR-CALNAME

  if (calendarParsed.events === undefined) {
    editor.flashNotification("Did not parse events from iCalendar");
    return [];
  }

  const events: Event[] = calendarParsed.events.map((ics) => {
    return {
      summary: ics.summary,
      description: ics.description,
    };
  });

  return applyQuery(query, events);
}
