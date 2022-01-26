import { combineLatest, map } from "rxjs";

import * as $RMRK from "../index";

const address = "...";

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
