# truth
A centralized, proxy-based state store with pre &amp; post operation support.

This library can be used to create nested proxies when sub-properties are accessed (e.g. `proxy.sub.prop=val` will still be handled by the original proxy trap).

Example:

`const state=truth(validate,{initalValue},sendChangeToServer)`