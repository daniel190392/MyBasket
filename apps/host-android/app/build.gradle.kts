import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.facebook.react")
}

// The plugin defaults assume the React Native project root is one level above the Android project and
// node_modules sits next to it. Here the Android project is the root and node_modules is hoisted to the monorepo root.
react {
    root.set(rootDir)
    reactNativeDir.set(rootDir.resolve("../../node_modules/react-native"))
    codegenDir.set(rootDir.resolve("../../node_modules/@react-native/codegen"))
    cliFile.set(rootDir.resolve("../../node_modules/react-native/cli.js"))
    hermesCommand.set(rootDir.resolve("../../node_modules/react-native/sdks/hermesc/%OS-BIN%/hermesc").path)
    autolinkLibrariesWithApp()
}

// Auth backend settings come from the git-ignored local.properties (see local.properties.example).
val localProperties = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) file.inputStream().use { load(it) }
}

fun buildConfigString(propertyName: String): String =
    "\"${localProperties.getProperty(propertyName, "")}\""

android {
    namespace = "com.example.androidhostapp"
    compileSdk = 36
    ndkVersion = "27.1.12297006"

    defaultConfig {
        applicationId = "com.example.androidhostapp"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        buildConfigField("String", "AUTH_CLIENT_ID", buildConfigString("auth.clientId"))
        buildConfigField("String", "AUTH_ENDPOINT", buildConfigString("auth.endpoint"))

        testInstrumentationRunner ="androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters.addAll(providers.gradleProperty("reactNativeArchitectures").get().split(","))
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

// React Native requires Java 17. AGP 8 does not align Kotlin with compileOptions (AGP 9 does), so the target must match Java's explicitly.
kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)

    // The React Native Gradle plugin sets both versions from node_modules/react-native/package.json
    implementation("com.facebook.react:react-android")
    implementation("com.facebook.react:hermes-android")

    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}