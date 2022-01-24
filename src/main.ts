import { ApiPromise, WsProvider } from "@polkadot/api";
import { combineLatest, map } from "rxjs";

import * as statemine from "./chains/statemine";
import * as karura from "./chains/karura";
import * as bifrost from "./chains/bifrost";

const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

// Get a stream of each RMRK balance state
const statemineBalance$ = statemine.balance$(address);
const karuraBalance$ = karura.balance$(address);
const bifrostBalance$ = bifrost.balance$(address);

// Combine into total for verification.
const total$ = combineLatest([
  statemineBalance$,
  karuraBalance$,
  bifrostBalance$,
]).pipe(
  map(([statemine, karura, bifrost]) => {
    return {
      balance: statemine.balance + karura.balance + bifrost.balance,
    };
  })
);

// Print total user RMRK balance
total$.subscribe((total) => {
  console.log({ total });
});

// Providing PromiseApi can be done after setting up subscription
// Updated with a new node instance at a later time.

ApiPromise.create({
  provider: new WsProvider("wss://statemine-rpc.polkadot.io"),
}).then(statemine.provideApi);

ApiPromise.create({
  provider: new WsProvider("wss://karura.polkawallet.io"),
}).then(karura.provideApi);

ApiPromise.create({
  provider: new WsProvider("wss://bifrost-rpc.liebi.com/ws"),
}).then(bifrost.provideApi);
