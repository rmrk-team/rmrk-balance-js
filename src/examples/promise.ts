import { ApiPromise, WsProvider } from "@polkadot/api";
import { moonriver } from "../chains/moonriver";
import { karura } from "../chains/karura";

async function main() {
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

  const [moonbalance, karurabalance] = await Promise.all([
    moonriver.balance("0xfbea1b97406C6945D07F50F588e54144ea8B684f"),
    karura.balance("D6HSL6nGXHLYWSN8jiL9MSNixH2F2o382KkHsZAtfZvBnxM"),
  ]);

  console.log({
    moonbalance,
    karurabalance,
    total: moonbalance.balance + karurabalance.balance,
  });
}

main();
