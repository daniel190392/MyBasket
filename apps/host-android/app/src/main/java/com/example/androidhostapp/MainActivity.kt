package com.example.androidhostapp

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Button(onClick = {
                        // Apuntamos a RNModuleActivity
                        val intent = Intent(this@MainActivity, RNModuleActivity::class.java)
                        startActivity(intent)
                    }) {
                        Text("Abrir Componente React Native")
                    }
                    Button(onClick = {
                        startActivity(Intent(this@MainActivity, AuthActivity::class.java))
                    }) {
                        Text(stringResource(R.string.open_auth))
                    }
                }
            }
        }
    }
}