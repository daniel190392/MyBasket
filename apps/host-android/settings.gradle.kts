pluginManagement {
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
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()

        // Apunta a la raíz real de node_modules (subiendo 2 niveles desde host-android)
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
