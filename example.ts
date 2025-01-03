import { createDAVClient } from "tsdav";

const client = await createDAVClient({
  serverUrl:
    "https://calendar.google.com/calendar/ical/marqus34%40gmail.com/private-df2ea81c13f2fa2b9d837aef069effe6/basic.ics",
  credentials: {
    username: "exemplar",
    password: Deno.env.get("DAV_PASSWORD"),
  },
  authMethod: "Basic",
  defaultAccountType: "caldav",
});

const calendars = await client.fetchCalendars();
console.log(calendars);
