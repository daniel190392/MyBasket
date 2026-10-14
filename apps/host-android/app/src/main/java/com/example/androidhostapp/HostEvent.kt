package com.example.androidhostapp

// What a React Native root can report to the host. The wire names are the strings the JS side sends
// (src/native/hostEvents.ts): change both together.
enum class HostEvent(val wireName: String) {
    SIGNED_IN("signedIn"),
    SIGNED_OUT("signedOut");

    companion object {
        fun fromWireName(name: String): HostEvent? = entries.firstOrNull { it.wireName == name }
    }
}
