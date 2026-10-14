package com.example.androidhostapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate

// The only activity of the app: it hosts the React Native root, which decides what to show from the session state.
class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "AppRoot"

    // The host owns the backend settings; the root only receives them as initial props.
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        object : DefaultReactActivityDelegate(
            this,
            mainComponentName!!,
            DefaultNewArchitectureEntryPoint.fabricEnabled
        ) {
            override fun getLaunchOptions(): Bundle = Bundle().apply {
                putString(AUTH_CLIENT_ID_PROP, BuildConfig.AUTH_CLIENT_ID)
                putString(AUTH_ENDPOINT_PROP, BuildConfig.AUTH_ENDPOINT)
            }
        }

    private companion object {
        const val AUTH_CLIENT_ID_PROP = "clientId"
        const val AUTH_ENDPOINT_PROP = "endpoint"
    }
}
