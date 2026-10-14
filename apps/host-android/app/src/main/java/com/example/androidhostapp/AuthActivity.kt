package com.example.androidhostapp

// The launcher: it restores the session and shows the login when there is none.
class AuthActivity : HostReactActivity() {

    override fun getMainComponentName(): String = "AuthRoot"
}
