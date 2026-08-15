GoAI — Android APK scaffolding (WebView)

This repository contains the original GoAI web/electron assets at the project root (index.html, main.js, assets/...).

What was added:
- android/ — Android Studio project scaffold that loads the web app inside a WebView.
  - The app module's Gradle build copies files from the project root (index.html, main.js, assets/**) into app/src/main/assets/www before build.
  - MainActivity loads file:///android_asset/www/index.html in a WebView.
- README.md — this file
- .gitignore — ignores node_modules, Android build outputs, and common artifacts

Target Android versions:
- minSdkVersion: 33 (Android 13)
- targetSdkVersion: 36 (Android 16)
- compileSdkVersion: 36

How to build (on a machine with Android Studio and Android SDK/NDK installed):
1. Open android/ in Android Studio.
2. Let Android Studio sync Gradle. (Gradle plugin 8+ and Kotlin plugin are used.)
3. Build or run on an Android 13-16 device or emulator.

Notes and limitations:
- This scaffold expects the web app files to remain at the project root (index.html, main.js, preload.js, package.json, package-lock.json, assets/**). The Gradle task in app/build.gradle copies them into the APK assets at build time. Do not delete or rename those files unless you update the copy rules.
- The app uses a WebView. If the original GoAI depends on native Electron APIs or a local native binary (GoAI.exe), those will not run on Android. If you need native functionality, consider porting the native code to Android (NDK) or reimplementing those features in Java/Kotlin or via a backend service.

Publishing to GitHub:
- A local git repository is initialized and an initial commit was made. To publish to GitHub, create a new repository on GitHub and push:
  git remote add origin https://github.com/<your-username>/<repo>.git
  git branch -M main
  git push -u origin main

If you want, provide GitHub push access (or grant GH CLI auth) and the repo name and a remote can be created automatically.
