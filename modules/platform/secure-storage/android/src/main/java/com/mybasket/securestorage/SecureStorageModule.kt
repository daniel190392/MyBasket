package com.mybasket.securestorage

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.security.GeneralSecurityException

/**
 * Stores each value encrypted by [KeystoreCipher] in a private SharedPreferences file.
 *
 * Failures reject the promise with a stable code instead of being swallowed, so the JS side decides
 * what an unreadable value means (for example, a key lost after a device restore).
 */
class SecureStorageModule(reactContext: ReactApplicationContext) :
    NativeSecureStorageSpec(reactContext) {

    private val cipher = KeystoreCipher()
    private val preferences =
        reactContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    override fun getItem(key: String, promise: Promise) {
        val encrypted = preferences.getString(key, null)
        if (encrypted == null) {
            promise.resolve(null)
            return
        }
        try {
            promise.resolve(cipher.decrypt(encrypted))
        } catch (error: GeneralSecurityException) {
            promise.reject(ERROR_DECRYPT_FAILED, "Could not decrypt the stored value", error)
        }
    }

    override fun setItem(key: String, value: String, promise: Promise) {
        try {
            val isWritten = preferences.edit().putString(key, cipher.encrypt(value)).commit()
            if (isWritten) {
                promise.resolve(null)
            } else {
                promise.reject(ERROR_WRITE_FAILED, "Could not write the encrypted value")
            }
        } catch (error: GeneralSecurityException) {
            promise.reject(ERROR_ENCRYPT_FAILED, "Could not encrypt the value", error)
        }
    }

    override fun removeItem(key: String, promise: Promise) {
        val isRemoved = preferences.edit().remove(key).commit()
        if (isRemoved) {
            promise.resolve(null)
        } else {
            promise.reject(ERROR_WRITE_FAILED, "Could not remove the stored value")
        }
    }

    companion object {
        const val NAME = NativeSecureStorageSpec.NAME

        private const val PREFERENCES_NAME = "com.mybasket.securestorage"
        private const val ERROR_DECRYPT_FAILED = "decrypt-failed"
        private const val ERROR_ENCRYPT_FAILED = "encrypt-failed"
        private const val ERROR_WRITE_FAILED = "write-failed"
    }
}
