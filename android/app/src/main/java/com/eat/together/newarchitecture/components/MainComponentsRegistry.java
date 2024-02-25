package com.eat.together.newarchitecture.components;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.soloader.SoLoader;

/**
 * MainComponentsRegistry is responsible for loading custom Fabric Components. It utilizes native methods and requires
 * a corresponding C++ implementation/header file (already placed in the jni/
 * folder for you).
 *
 * This class is active only when the New Architecture is enabled (controlled by the `newArchEnabled` property).
 */
@DoNotStrip
public class MainComponentsRegistry {
  static {
    SoLoader.loadLibrary("fabricjni");
  }

  @DoNotStrip private final HybridData mHybridData;

  @DoNotStrip
  private native HybridData initHybrid(ComponentFactory componentFactory);

  @DoNotStrip
  private MainComponentsRegistry(ComponentFactory componentFactory) {
    mHybridData = initHybrid(componentFactory);
  }

  @DoNotStrip
  public static MainComponentsRegistry register(ComponentFactory componentFactory) {
    return new MainComponentsRegistry(componentFactory);
  }
}
  public static MainComponentsRegistry register(ComponentFactory componentFactory) {
    return new MainComponentsRegistry(componentFactory);
  }
}
