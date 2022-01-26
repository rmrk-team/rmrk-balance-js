#!/usr/bin/env node

const log = console.log;
console.log = function () {};
console.debug = function () {};
console.warn = function () {};
console.error = function () {};

import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  throwError,
} from "rxjs";
import colors from "colors/safe";

import * as $RMRK from "./";

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const address = argv.address || argv.a;

$RMRK.provideDefaults();

const addressErrorCatcher = catchError<
  $RMRK.Balance,
  Observable<$RMRK.FormatError>
>((error: any, caught) => {
  if ($RMRK.FormatError.is(error)) {
    return of(error);
  }
  return throwError(() => error);
});

// Get a stream of each RMRK balance state
const statemineBalance$ = $RMRK.statemine
  .balance$(address)
  .pipe(addressErrorCatcher);

const moonriverBalance$ = $RMRK.moonriver
  .balance$(address)
  .pipe(addressErrorCatcher);

const karuraBalance$ = $RMRK.karura.balance$(address).pipe(addressErrorCatcher);

const bifrostBalance$ = $RMRK.bifrost
  .balance$(address)
  .pipe(addressErrorCatcher);

log(colors.blue("Connecting to chains..."));

const balances$ = combineLatest([
  statemineBalance$,
  moonriverBalance$,
  karuraBalance$,
  bifrostBalance$,
]).pipe(
  map(([statemine, moonriver, karura, bifrost]) => {
    const total = [statemine, moonriver, karura, bifrost].reduce<$RMRK.Balance>(
      (acc, next) => {
        return $RMRK.concat(
          acc,
          $RMRK.FormatError.is(next) ? $RMRK.empty() : next
        );
      },
      $RMRK.empty()
    );

    return [
      ["statemine", statemine],
      ["moonriver", moonriver],
      ["karura", karura],
      ["bifrost", bifrost],
      ["total", total],
    ];
  })
);

// Print total user RMRK balance
balances$.subscribe((balances) => {
  log(`\n------------ ${colors.magenta("RMRK BALANCE")} ------------`);
  log(
    balances
      .map(([name, balance]) => {
        if ($RMRK.FormatError.is(balance)) {
          return `${name}: ${colors.gray(
            "supplied address not valid for network"
          )}`;
        } else {
          return `${name}: ${colors.green(
            $RMRK.format(balance as $RMRK.Balance)
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
