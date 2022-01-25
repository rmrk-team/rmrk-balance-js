#!/usr/bin/env node

const log = console.log;
console.log = function () {};
console.debug = function () {};
console.warn = function () {};
console.error = function () {};

import { ApiPromise, WsProvider } from "@polkadot/api";
import { combineLatest, map, of } from "rxjs";
import colors from "colors/safe";

import * as statemine from "./chains/statemine";
import * as moonriver from "./chains/moonriver";
import * as karura from "./chains/karura";
import * as bifrost from "./chains/bifrost";
import { format } from ".";
import { isValidSubstrateAddress } from "./lib/isSubstrateAddress";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const address = argv.address || argv.a;

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

// Get a stream of each RMRK balance state
const statemineBalance$ = statemine.balance$(address);
const moonriverBalance$ = moonriver.balance$(
  "0xfbea1b97406C6945D07F50F588e54144ea8B684f"
);
const karuraBalance$ = karura.balance$(address);
const bifrostBalance$ = bifrost.balance$(address);

log(colors.blue("connection to chains..."));

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
  log(`\n------------ ${colors.magenta("RMRK BALANCE")} ------------`);
  Object.keys(balances).map((network: string) => {
    log(
      `${network}: ${colors.green(
        format((balances as any)[network])
      )} ${colors.magenta("RMRK")}`
    );
  });
  log(`-----------------------------------------------------------`);
  setTimeout(() => {
    process.exit();
  });
});

// Can be done at a later time than starting the subscriptions.
// They will wait for the apis to be ready.
