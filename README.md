# SilverBullet iCalendar Plug

`silverbullet-icalendar` is a [Plug](https://silverbullet.md/Plugs) for [SilverBullet](https://silverbullet.md/) which I made for my girlfriend.
It reads external [iCalendar](https://en.wikipedia.org/wiki/ICalendar) data, also known as iCal and `.ics` format, used in CalDAV protocol.

## Installation

Open your `PLUGS` note in SilverBullet and add this plug to the list:

```yaml
- ghr:Maarrk/silverbullet-icalendar
```

Then run the {[Plugs: Update]} command and off you go!

### Configuration

This plug can be configured with [Space Config](https://silverbullet.md/Space%20Config), these are the default values and their usage:

```yaml
icalendar:
  # where to get the iCalendar data from
  sources:
  - url: https://example.com/calendar.ics
    # override calName for events from this source, otherwise X-WR-CALNAME is used
    calName: Example calendar
```

## Usage

The plug provides the query source `ical-event`, which corresponds to `VEVENT` object

<!-- TODO: Describe properties in detail -->

### Examples

Select events that start on a given date

~~~
```query
ical-event
where start =~ /^2024-01-04/
select summary, description
```
~~~

## Roadmap

- Load multiple sources from Space Config, instead of SECRETS
- Decide which properties should be exposed:
  - Location
  - Color?
- Add instructions for popular services:
  - Nextcloud
  - Google Calendar
- Write config schema
- Add `calName` property to event object
- Command for plug version with lower priority (cf. `silverbullet-grep`)
- Cache the calendar according to `REFRESH-INTERVAL` or `X-PUBLISHED-TTL`, command for manual update
- More query sources:
  - `ical-todo` for `VTODO` components
  - `ical-calendar` showing information about configured calendars
- Support `file://` URL scheme (use an external script or filesystem instead of authentication on CalDAV)

## Contributing

If you find bugs, report them on the [issue tracker on GitHub](https://github.com/Maarrk/silverbullet-icalendar/issues).

### Building from source

To build this plug, make sure you have [SilverBullet installed](https://silverbullet.md/Install). Then, build the plug with:

```shell
deno task build
```

Or to watch for changes and rebuild automatically

```shell
deno task watch
```

Then, copy the resulting `.plug.js` file into your space's `_plug` folder. Or build and copy in one command:

```shell
deno task build && cp *.plug.js /my/space/_plug/
```

SilverBullet will automatically sync and load the new version of the plug (or speed up this process by running the {[Sync: Now]} command).

## License

MIT, following SilverBullet
