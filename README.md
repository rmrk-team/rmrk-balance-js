# @rmrk/rmrk-balance-js

## Quickstart

### Observables

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { combineLatest, map } from "rxjs";

import { statemine, karura, bifrost, moonriver } from "@rmrk/rmrk-balance-js";

// Address that holds RMRK on substrate chains
const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

// Get a stream of each RMRK balance state
const statemineBalance$ = statemine.balance$(address);
const moonriverBalance$ = moonriver.balance$(address);
const karuraBalance$ = karura.balance$(address);
const bifrostBalance$ = bifrost.balance$(address);

// Combine into a stream of total for verification.
const total$ = combineLatest([
  statemineBalance$,
  moonriverBalance$,
  karuraBalance$,
  bifrostBalance$,
]).pipe(
  map(([statemine, moonriver, karura, bifrost]) => {
    return {
      balance:
        statemine.balance +
        moonriver.balance +
        karura.balance +
        bifrost.balance,
    };
  })
);

total$.subscribe((total) => {
  console.log({ total });
});

ApiPromise.create({
  provider: new WsProvider("wss://statemine-rpc.polkadot.io"),
}).then(statemine.provideApi);

ApiPromise.create({
  provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
}).then(moonriver.provideApi);

ApiPromise.create({
  provider: new WsProvider("wss://karura.polkawallet.io"),
}).then(karura.provideApi);

ApiPromise.create({
  provider: new WsProvider("wss://bifrost-rpc.liebi.com/ws"),
}).then(bifrost.provideApi);
```

### Promise

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";

import { moonriver, karura } from "@rmrk/rmrk-balance-js";

async function main() {
  const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

  const [moonriverApi, karuraApi] = await Promise.all([
    ApiPromise.create({
      provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
    }),
    ApiPromise.create({
      provider: new WsProvider("wss://karura.polkawallet.io"),
    }),
  ]);

  moonriver.provideApi(moonriverApi);
  karura.provideApi(karuraApi);

  const [moonbalance, karurabalance] = await Promise.all([
    moonriver.balance(address),
    moonriver.balance(address),
  ]);

  console.log({
    moonbalance,
    karurabalance,
    total: moonbalance.balance + karurabalance.balance,
  });
}
```
