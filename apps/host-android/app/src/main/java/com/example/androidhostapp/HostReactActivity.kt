package com.example.androidhostapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate

// A native destination that shows one React Native root. Every root receives the same settings: the host
// owns the backend configuration and the roots only get it as initial props.
abstract class HostReactActivity : ReactActivity() {

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        object : DefaultReactActivityDelegate(
            this,
            requireNotNull(mainComponentName),
            DefaultNewArchitectureEntryPoint.fabricEnabled
        ) {
            override fun getLaunchOptions(): Bundle = Bundle().apply {
                putString(AUTH_CLIENT_ID_PROP, BuildConfig.AUTH_CLIENT_ID)
                putString(AUTH_ENDPOINT_PROP, BuildConfig.AUTH_ENDPOINT)
                putString(API_BASE_URL_PROP, BuildConfig.API_BASE_URL)
            }
        }

    private companion object {
        const val AUTH_CLIENT_ID_PROP = "clientId"
        const val AUTH_ENDPOINT_PROP = "endpoint"
        const val API_BASE_URL_PROP = "apiBaseUrl"
    }
}
