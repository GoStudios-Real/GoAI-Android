package com.gostudios.goai

import android.app.ActivityManager
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webview)

        // Basic stability and performance settings for low-end devices
        val ws: WebSettings = webView.settings
        ws.javaScriptEnabled = true
        ws.domStorageEnabled = true
        try {
            // Use reflection: setAppCacheEnabled was removed from newer SDKs, call if present
            val m = ws.javaClass.getMethod("setAppCacheEnabled", java.lang.Boolean.TYPE)
            m.invoke(ws, java.lang.Boolean.TRUE)
        } catch (e: Exception) {
            // ignore when not available
        }
        ws.cacheMode = WebSettings.LOAD_DEFAULT
        // Offscreen pre-rastering can increase memory usage on low-end devices
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try { ws.offscreenPreRaster = false } catch (e: Exception) { }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try { ws.safeBrowsingEnabled = true } catch (e: Exception) { }
        }

        // Adjust layer type based on available memory (use software rendering on low-memory devices)
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        if (am.memoryClass < 128) {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        } else {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        }

        webView.setBackgroundColor(Color.WHITE)

        // Provide a robust WebViewClient that falls back to a lightweight page on error
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                super.onReceivedError(view, request, error)
                // On failure load a simple fallback page shipped with the APK
                try {
                    view.loadUrl("file:///android_asset/www/fallback.html")
                } catch (e: Exception) {
                    Toast.makeText(this@MainActivity, "App failed to load", Toast.LENGTH_LONG).show()
                }
            }
        }

        // Load main app and catch exceptions to avoid crash
        try {
            webView.loadUrl("file:///android_asset/www/index.html")
        } catch (e: Exception) {
            // If loading the full app causes an exception, load lightweight fallback
            try {
                webView.loadUrl("file:///android_asset/www/fallback.html")
            } catch (ex: Exception) {
                Toast.makeText(this, "Unable to load app", Toast.LENGTH_LONG).show()
            }
        }
    }
}
