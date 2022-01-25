import { ApiPromise, WsProvider } from "@polkadot/api";
import { combineLatest, map } from "rxjs";

import * as statemine from "../chains/statemine";
import * as moonriver from "../chains/moonriver";
import * as karura from "../chains/karura";
import * as bifrost from "../chains/bifrost";

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

setTimeout(() => {
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
}, 1500);
