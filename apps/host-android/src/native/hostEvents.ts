import NativeHostEvents from './NativeHostEvents';

// The events a root can report to the native host. The names are the wire
// format shared with HostEvent.kt: change both together.
export type HostEvent = 'signedIn' | 'signedOut';

export function reportHostEvent(event: HostEvent): Promise<void> {
  return NativeHostEvents.report(event);
}
