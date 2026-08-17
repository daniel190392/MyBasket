package com.example.androidhostapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class RNModuleActivity : ReactActivity() {

    override fun getMainComponentName(): String = "UIComponentsView"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName!!, false)
}