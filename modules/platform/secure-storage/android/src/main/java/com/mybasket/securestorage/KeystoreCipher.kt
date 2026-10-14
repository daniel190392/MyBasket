package com.mybasket.securestorage

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.security.ProviderException
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * Encrypts text with an AES-GCM key that is generated inside the Android Keystore and never leaves it.
 *
 * The result is `base64(iv + ciphertext)`: GCM needs the same IV to decrypt, and the Keystore picks a
 * fresh random one on every encryption, so it is stored next to the data.
 */
internal class KeystoreCipher {

    /** @throws GeneralSecurityException when the Keystore cannot encrypt, so callers handle a single failure type. */
    fun encrypt(plainText: String): String = asSecurityFailure {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        val encrypted = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
        Base64.encodeToString(cipher.iv + encrypted, Base64.NO_WRAP)
    }

    /**
     * @throws GeneralSecurityException for any value that cannot be decrypted, including one that is not
     * well formed, so callers handle a single failure type.
     */
    fun decrypt(encoded: String): String = asSecurityFailure {
        val payload = decode(encoded)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(
            Cipher.DECRYPT_MODE,
            getOrCreateKey(),
            GCMParameterSpec(AUTHENTICATION_TAG_SIZE_BITS, payload, 0, INITIALIZATION_VECTOR_SIZE_BYTES)
        )
        val decrypted = cipher.doFinal(
            payload,
            INITIALIZATION_VECTOR_SIZE_BYTES,
            payload.size - INITIALIZATION_VECTOR_SIZE_BYTES
        )
        String(decrypted, Charsets.UTF_8)
    }

    // The Keystore reports its own failures as an unchecked ProviderException, which would skip the callers'
    // GeneralSecurityException handling and crash the app instead of rejecting the promise.
    private inline fun <T> asSecurityFailure(block: () -> T): T =
        try {
            block()
        } catch (error: ProviderException) {
            throw GeneralSecurityException("The Android Keystore failed", error)
        }

    private fun decode(encoded: String): ByteArray {
        val payload = try {
            Base64.decode(encoded, Base64.NO_WRAP)
        } catch (error: IllegalArgumentException) {
            throw GeneralSecurityException("The stored value is not valid Base64", error)
        }
        if (payload.size <= INITIALIZATION_VECTOR_SIZE_BYTES) {
            throw GeneralSecurityException("The stored value is too short to hold an IV and data")
        }
        return payload
    }

    private fun getOrCreateKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        return keyStore.getKey(KEY_ALIAS, null) as? SecretKey ?: createKey()
    }

    private fun createKey(): SecretKey {
        val keySpec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(KEY_SIZE_BITS)
            .build()
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        generator.init(keySpec)
        return generator.generateKey()
    }

    private companion object {
        const val ANDROID_KEYSTORE = "AndroidKeyStore"
        const val KEY_ALIAS = "com.mybasket.securestorage.key"
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val KEY_SIZE_BITS = 256
        const val INITIALIZATION_VECTOR_SIZE_BYTES = 12
        const val AUTHENTICATION_TAG_SIZE_BITS = 128
    }
}
