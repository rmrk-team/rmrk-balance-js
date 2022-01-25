import { ApiPromise, WsProvider } from "@polkadot/api";
import * as moonriver from "../chains/moonriver";
import * as karura from "../chains/karura";

async function main() {
  const address = "D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM";

  const [moonriverApi, karuraApi] = await Promise.all([
    ApiPromise.create({
      provider: new WsProvider("wss://wss.moonriver.moonbeam.network"),
    }),
    ApiPromise.create({
      provider: new WsProvider("wss://karura.polkawallet.io"),
    }),
  ]);

  moonriver.provideApi(moonriverApi);
  karura.provideApi(karuraApi);

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
