package com.example.androidhostapp

import android.app.Activity
import android.content.Intent

// Decides where the app goes from what the roots report. Moving replaces the current destination, so the
// back stack never returns to a screen the session state has made obsolete.
object NavigationCoordinator {

    fun handle(event: HostEvent, from: Activity) {
        val destination = destinationFor(event)
        if (destination.isInstance(from)) return

        from.startActivity(Intent(from, destination))
        from.finish()
    }

    private fun destinationFor(event: HostEvent): Class<out Activity> = when (event) {
        HostEvent.SIGNED_IN -> HomeActivity::class.java
        HostEvent.SIGNED_OUT -> AuthActivity::class.java
    }
}
