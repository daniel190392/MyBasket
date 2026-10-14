package com.example.androidhostapp

// Opened once the user is signed in. It is the only activity left on the back stack, so back leaves the app.
class HomeActivity : HostReactActivity() {

    override fun getMainComponentName(): String = "HomeRoot"
}
