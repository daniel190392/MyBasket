pluginManagement {
    // The React Native Gradle plugin is consumed from node_modules so it always matches the react-native package.
    includeBuild("../../node_modules/@react-native/gradle-plugin")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
    id("com.facebook.react.settings")
}
extensions.configure<com.facebook.react.ReactSettingsExtension> {
    // The defaults assume the Android project lives in an `android/` subfolder, so they would run the command
    // and watch the lockfiles one level above this folder. Here this folder is the React Native project root.
    autolinkLibrariesFromCommand(
        workingDirectory = rootDir,
        lockFiles = layout.rootDirectory.files("../../package-lock.json", "package.json", "react-native.config.js")
    )
}
dependencyResolutionManagement {
    // The React Native plugin declares project repositories of its own, which FAIL_ON_PROJECT_REPOS would reject.
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()

        // node_modules lives at the monorepo root, two levels above host-android
        maven {
            url = uri("${rootDir}/../../node_modules/react-native/android")
        }
        maven {
            url = uri("${rootDir}/../../node_modules/jsc-android/dist")
        }
    }
}

rootProject.name = "AndroidHostApp"
include(":app")
includeBuild("../../node_modules/@react-native/gradle-plugin")
