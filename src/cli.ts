#!/usr/bin/env node

import { ApiPromise, WsProvider } from "@polkadot/api";
import { combineLatest, map } from "rxjs";

import * as statemine from "./chains/statemine";
import * as moonriver from "./chains/moonriver";
import * as karura from "./chains/karura";
import * as bifrost from "./chains/bifrost";
import { format } from ".";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const address = argv.address || argv.a;

// Get a stream of each RMRK balance state
const statemineBalance$ = statemine.balance$(address);
const moonriverBalance$ = moonriver.balance$(address);
const karuraBalance$ = karura.balance$(address);
const bifrostBalance$ = bifrost.balance$(address);

statemine.provideApi(
  ApiPromise.create({
    provider: new WsProvider("wss://statemine-rpc.polkadot.io"),
  })
);

moonriver.provideApi(
  ApiPromise.create({
    provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
  })
);

karura.provideApi(
  ApiPromise.create({
    provider: new WsProvider("wss://karura.polkawallet.io"),
  })
);

bifrost.provideApi(
  ApiPromise.create({
    provider: new WsProvider("wss://bifrost-rpc.liebi.com/ws"),
  })
);

// Combine into total for verification.
const balances$ = combineLatest([
  statemineBalance$,
  moonriverBalance$,
  karuraBalance$,
  bifrostBalance$,
]).pipe(
  map(([statemine, moonriver, karura, bifrost]) => {
    return {
      statemine,
      moonriver,
      karura,
      bifrost,
      total: {
        balance:
          statemine.balance +
          moonriver.balance +
          karura.balance +
          bifrost.balance,
      },
    };
  })
);

// Print total user RMRK balance
balances$.subscribe((balances) => {
  Object.keys(balances).map((network: string) => {
    console.log(`${network}: ${format((balances as any)[network])} RMRK`);
  });
  setTimeout(() => {
    process.exit();
  });
});

// Can be done at a later time than starting the subscriptions.
// They will wait for the apis to be ready.
