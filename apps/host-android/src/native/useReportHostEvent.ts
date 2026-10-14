import { useEffect, useState } from 'react';

import { reportHostEvent } from './hostEvents';

import type { HostEvent } from './hostEvents';

// Reports `event` to the native host once `shouldReport` becomes true and
// returns whether the report failed, so the root can show it instead of
// leaving the user on a screen the host has stopped controlling.
export function useReportHostEvent(
  event: HostEvent,
  shouldReport: boolean
): boolean {
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (!shouldReport) return;

    reportHostEvent(event).catch(() => setHasFailed(true));
  }, [event, shouldReport]);

  return hasFailed;
}
