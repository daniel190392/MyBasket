package com.example.androidhostapp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

/**
 * Receives the events the React Native roots report and hands them to the [NavigationCoordinator].
 *
 * Failures reject the promise with a stable code instead of being swallowed, so the root can tell the
 * user that the host did not move.
 */
class HostEventsModule(reactContext: ReactApplicationContext) : NativeHostEventsSpec(reactContext) {

    override fun report(event: String, promise: Promise) {
        val hostEvent = HostEvent.fromWireName(event)
        if (hostEvent == null) {
            promise.reject(ERROR_UNKNOWN_EVENT, "Unknown host event: $event")
            return
        }

        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject(ERROR_NO_ACTIVITY, "There is no activity to navigate from")
            return
        }

        activity.runOnUiThread {
            NavigationCoordinator.handle(hostEvent, activity)
            promise.resolve(null)
        }
    }

    companion object {
        const val NAME = NativeHostEventsSpec.NAME

        private const val ERROR_UNKNOWN_EVENT = "unknown-event"
        private const val ERROR_NO_ACTIVITY = "no-activity"
    }
}
