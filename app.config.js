module.exports = {
  "expo": {
    "name": "Eat Together!",
    "owner": "eat-together-team",
    "slug": "eat-together",
    "description": "Connecting students through shared meals.",
    "version": "1.6.3",
    "orientation": "portrait",
    "icon": "./assets/big_logo.png",
    "scheme": "com.eat.together",
    "newArchEnabled": true,
    "jsEngine": "hermes",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#73AE7B"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "android": {
      "package": "com.eattogether.android",
      "icon": "./assets/big_logo.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/icon_foreground.png",
        "backgroundColor": "#73AE7B",
        "monochromeImage": "./assets/icons/icon_monochrome.png"
      },
      "versionCode": 5,
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MEDIA_LIBRARY",
        "android.permission.MEDIA_LIBRARY_WRITE_ONLY"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.eat.together",
      "buildNumber": "29",
      "icon": "./assets/big_logo.png",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "web": {
      "favicon": "./assets/big_logo.png"
    },
    "runtimeVersion": "1.0.1",
    "userInterfaceStyle": "automatic",
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you pick a profile image."
        }
      ],
      "expo-font",
      [
        "expo-build-properties",
        {
          "android": {
            "kotlinVersion": "2.1.21"
          }
        }
      ],
      "expo-web-browser",
      [
        "@react-native-community/datetimepicker"
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "605daf62-9a09-4742-8204-1f8dfb5e4363"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/605daf62-9a09-4742-8204-1f8dfb5e4363"
    }
  }
}
