import { ApiPromise, WsProvider } from "@polkadot/api";
import * as $RMRK from "../";

async function main() {
  const address = "...";

  $RMRK.provideDefaults();

  const [moonbalance, karurabalance] = await Promise.all([
    $RMRK.moonriver.balance(address),
    $RMRK.karura.balance(address),
  ]);

  console.log({
    moonbalance,
    karurabalance,
    total: moonbalance.balance + karurabalance.balance,
  });
}

main();
