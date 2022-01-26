# @rmrk-team/rmrk-balance-js

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

### Promise

```typescript
import * as $RMRK from "@rmrk-team/rmrk-balance-js";

async function main() {
  const address = "CAeCc....nK3B";

  $RMRK.provideDefaults();

  const [moonbalance, karurabalance] = await Promise.all([
    $RMRK.moonriver.balance(address),
    $RMRK.karura.balance(address),
  ]);

  const total = $RMRK.concat(moonbalance, karurabalance);

  console.log($RMRK.format(total));
}

main();
```

### Observables

```typescript
import { combineLatest, map } from "rxjs";
import * as $RMRK from "@rmrk-team/rmrk-balance-js";

const address = "CAeCc....nK3B";

// Get a stream of each RMRK balance state
const statemineBalance$ = $RMRK.statemine.balance$(address);
const moonriverBalance$ = $RMRK.moonriver.balance$(address);
const karuraBalance$ = $RMRK.karura.balance$(address);
const bifrostBalance$ = $RMRK.bifrost.balance$(address);

$RMRK.provideDefaults();

// Combine into total for verification.
const total$ = combineLatest([
  statemineBalance$,
  moonriverBalance$,
  karuraBalance$,
  bifrostBalance$,
]).pipe(
  map(([statemine, moonriver, karura, bifrost]) => {
    return $RMRK.concat(statemine, moonriver, karura, bifrost);
  })
);

// Print total user RMRK balance
total$.subscribe((total) => {
  console.log($RMRK.format(total.balance));
});
```

### Use existing Polkadotjs ApiPromise or custom node.

```typescript
import * as $RMRK from "@rmrk-team/rmrk-balance-js";

$RMRK.moonriver.provideContext(
  ApiPromise.create({
    provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
  })
);

$RMRK.moonriver.balance("0xfv...6c1h").then((balance) => {
  console.log($RMRK.format(balance));
});
```

### Observable `balance$` API : Error handling

```typescript
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  throwError,
} from "rxjs";

import * as $RMRK from "@rmrk-team/rmrk-balance-js";

const address = "...";

$RMRK.provideDefaults();

const addressErrorCatcher = catchError<
  $RMRK.Balance,
  Observable<$RMRK.FormatError>
>((error: unknown) => {
  if ($RMRK.FormatError.is(error)) {
    return of(error);
  }
  return throwError(() => error);
});

const statemineBalance$ = $RMRK.statemine
  .balance$(address)
  .pipe(addressErrorCatcher);

const bifrostBalance$ = $RMRK.bifrost
  .balance$(address)
  .pipe(addressErrorCatcher);

const total$ = combineLatest([statemineBalance$, bifrostBalance$]).pipe(
  map((balances) => {
    const total = balances.reduce<$RMRK.Balance>((acc, next) => {
      return $RMRK.concat(
        acc,
        $RMRK.FormatError.is(next) ? $RMRK.empty() : next
      );
    }, $RMRK.empty());

    return total;
  })
);

total$.subscribe((total) => {
  console.log($RMRK.format(total));
});
```
