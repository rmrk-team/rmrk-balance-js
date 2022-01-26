# @rmrk/rmrk-balance-js

Read balances of the chains that support the $RMRK token. The following chains are currently supported:

- [x] Statemine
- [x] Moonriver
- [x] Karura
- [x] Bifrost

## Quickstart

```
yarn add | npm install @rmrk-team/rmrk-balance-js
```

### CLI

```bash
npm install -g @rmrk-team/rmrk-balance-js
rmrk-balance -a YOUR_ADDRESS
```

### Observables

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { combineLatest, map } from "rxjs";
import {
  statemine,
  karura,
  bifrost,
  moonriver,
} from "@rmrk-team/rmrk-balance-js";

const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

// Get a stream of each RMRK balance state
const statemineBalance$ = statemine.balance$(address);
const moonriverBalance$ = moonriver.balance$(address);
const karuraBalance$ = karura.balance$(address);
const bifrostBalance$ = bifrost.balance$(address);

// Combine into total for verification.
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

// Print total user RMRK balance
total$.subscribe((total) => {
  console.log({ total });
});

// Can be done at a later time than starting the subscriptions.
// They will wait for the apis to be ready.

statemine.provideContext(
  ApiPromise.create({
    provider: new WsProvider("wss://statemine-rpc.polkadot.io"),
  })
);

moonriver.provideContext(
  ApiPromise.create({
    provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
  })
);

karura.provideContext(
  ApiPromise.create({
    provider: new WsProvider("wss://karura.polkawallet.io"),
  })
);

bifrost.provideContext(
  ApiPromise.create({
    provider: new WsProvider("wss://bifrost-rpc.liebi.com/ws"),
  })
);
```

### Promise

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { moonriver, karura } from "@rmrk-team/rmrk-balance-js";

async function main() {
  const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

  moonriver.provideContext(
    ApiPromise.create({
      provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
    })
  );
  karura.provideContext(
    ApiPromise.create({
      provider: new WsProvider("wss://karura.polkawallet.io"),
    })
  );

  const [moonbalance, karurabalance] = await Promise.all([
    moonriver.balance(address),
    karura.balance(address),
  ]);

  console.log({
    moonbalance,
    karurabalance,
    total: moonbalance.balance + karurabalance.balance,
  });
}

main();
```
