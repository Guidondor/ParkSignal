// WeakRef polyfill for Hermes compatibility with react-native-screens
if (typeof WeakRef === 'undefined') {
  (global as any).WeakRef = class WeakRef<T extends object> {
    private _target: T;
    constructor(target: T) {
      this._target = target;
    }
    deref(): T {
      return this._target;
    }
  };
}
