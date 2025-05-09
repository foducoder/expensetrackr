# ExpenseTrackr - Android App Building Instructions

We've prepared the Android project structure for ExpenseTrackr. Here are the steps to build and install the app on your device:

## What's been set up

1. ✅ Created a complete web-based expense tracking app for India
2. ✅ Integrated Capacitor for Android app development
3. ✅ Added Android platform with required configurations
4. ✅ Set up SMS reading permissions in AndroidManifest.xml
5. ✅ Customized app configuration in capacitor.config.ts

## How to complete the build

To build the APK on your local machine, follow these steps:

1. Clone or download this project repository to your local machine
2. Make sure you have the following installed:
   - Node.js and npm (v14 or later)
   - JDK 11 or later
   - Android Studio (with Android SDK)
   - Gradle

3. Run the following commands:
   ```bash
   # Install dependencies
   npm install
   
   # Build the web app
   npm run build
   
   # Ensure Capacitor is synced
   npx cap sync android
   
   # Open in Android Studio
   npx cap open android
   ```

4. In Android Studio:
   - Wait for Gradle sync to complete
   - Click the "Build" menu, then "Build Bundle(s) / APK(s)" 
   - Choose "Build APK(s)"
   - The APK will be generated in: 
     `android/app/build/outputs/apk/debug/app-debug.apk`

5. Transfer this APK to your Android device and install it

## Key features of ExpenseTrackr

- Automatically reads and categorizes SMS from Indian banks and payment apps
- Tracks monthly expenses with categorization
- Provides month-by-month navigation
- Shows expense summaries and breakdowns
- Works seamlessly on Android devices

## Required permissions

The app needs these permissions to function properly:
- Internet access (for future cloud sync)
- SMS reading permission (to track transactions)
- SMS receiving permission (to track new transactions)

## Technical details

- The app is built using Capacitor, which wraps our web app in a native Android container
- SMS parsing happens client-side for privacy
- All data is stored on your device - no data is sent to external servers