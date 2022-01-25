import { ApiPromise, WsProvider } from "@polkadot/api";
import * as moonriver from "../chains/moonriver";
import * as karura from "../chains/karura";

async function main() {
  const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

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

  const [moonbalance, karurabalance] = await Promise.all([
    moonriver.balance(address),
    moonriver.balance(address),
  ]);

  console.log({
    moonbalance,
    karurabalance,
    total: moonbalance.balance + karurabalance.balance,
  });
}

main();
