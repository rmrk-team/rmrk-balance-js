#!/usr/bin/env node

const log = console.log;
console.log = function () {};
console.debug = function () {};
console.warn = function () {};
console.error = function () {};

import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  throwError,
} from "rxjs";
import colors from "colors/safe";

import { statemine } from "./chains/statemine";
import { moonriver } from "./chains/moonriver";
import { karura } from "./chains/karura";
import { bifrost } from "./chains/bifrost";
import { Balance, format } from ".";
import * as A from "./types/address";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const address = argv.address || argv.a;

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

const addressErrorCatcher = catchError<Balance, Observable<A.FormatError>>(
  (error: any, caught) => {
    if (A.FormatError.is(error)) {
      return of(error);
    }
    return throwError(() => error);
  }
);

// Get a stream of each RMRK balance state
const statemineBalance$ = statemine.balance$(address).pipe(addressErrorCatcher);
const moonriverBalance$ = moonriver.balance$(address).pipe(addressErrorCatcher);
const karuraBalance$ = karura.balance$(address).pipe(addressErrorCatcher);
const bifrostBalance$ = bifrost.balance$(address).pipe(addressErrorCatcher);

log(colors.blue("Connecting to chains..."));

const balances$ = combineLatest([
  statemineBalance$,
  moonriverBalance$,
  karuraBalance$,
  bifrostBalance$,
]).pipe(
  map(([statemine, moonriver, karura, bifrost]) => {
    return [
      ["statemine", statemine],
      ["moonriver", moonriver],
      ["karura", karura],
      ["bifrost", bifrost],
      [
        "total",
        {
          balance:
            (A.FormatError.is(statemine) ? BigInt(0) : statemine.balance) +
            (A.FormatError.is(moonriver) ? BigInt(0) : moonriver.balance) +
            (A.FormatError.is(karura) ? BigInt(0) : karura.balance) +
            (A.FormatError.is(bifrost) ? BigInt(0) : bifrost.balance),
        },
      ],
    ];
  })
);

// Print total user RMRK balance
balances$.subscribe((balances) => {
  log(`\n------------ ${colors.magenta("RMRK BALANCE")} ------------`);
  log(
    balances
      .map(([name, balance]) => {
        if (A.FormatError.is(balance)) {
          return `${name}: ${colors.gray(
            "supplied address not valid for network"
          )}`;
        } else {
          return `${name}: ${colors.green(
            format(balance as Balance)
          )} ${colors.magenta("RMRK")}`;
        }
      })
      .join("\n")
  );
  log(`-----------------------------------------------------------`);
  setTimeout(() => {
    process.exit();
  });
});

// Can be done at a later time than starting the subscriptions.
// They will wait for the apis to be ready.
