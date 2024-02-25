static {
    SoLoader.loadLibrary("fabricjni");
}
```

It features a private constructor that initializes the `HybridData` object through the `initHybrid` native method. The public static `register` method serves as the primary interface for registering a `ComponentFactory` with the registry:

```java
public static MainComponentsRegistry register(ComponentFactory componentFactory) {
    return new MainComponentsRegistry(componentFactory);
}
```

### Examples

#### Extending MainComponentsRegistry

To extend `MainComponentsRegistry` for custom component registration, developers can create a subclass that overrides the necessary methods or provides additional functionality.

#### Using MainComponentsRegistry

To use `MainComponentsRegistry` for registering components, developers can utilize the `register` method with a custom `ComponentFactory`:

```java
ComponentFactory customFactory = new CustomComponentFactory();
MainComponentsRegistry.register(customFactory);
