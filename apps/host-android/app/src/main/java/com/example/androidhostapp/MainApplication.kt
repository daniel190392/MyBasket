package com.example.androidhostapp

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.shell.MainReactPackage
import com.facebook.react.soloader.OpenSourceMergedSoMapping // <-- 1. IMPORTAR ESTO
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this@MainApplication) {

            override fun getPackages(): ArrayList<ReactPackage> =
                ArrayList<ReactPackage>().apply {
                    add(MainReactPackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = true

            override val isNewArchEnabled: Boolean = false
            override val isHermesEnabled: Boolean = true
        }

    override fun onCreate() {
        super.onCreate()

        // <-- 2. CAMBIAR ESTA LÍNEA:
        // SoLoader.init(this, false) // ❌ Forma antigua que causa el crash

        SoLoader.init(this, OpenSourceMergedSoMapping) // ✅ Usar la nueva asignación nativa
    }
}
