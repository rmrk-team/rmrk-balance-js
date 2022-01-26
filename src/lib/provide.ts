import { ApiPromise, WsProvider } from "@polkadot/api";
import { statemine } from "../chains/statemine";
import { moonriver } from "../chains/moonriver";
import { karura } from "../chains/karura";
import { bifrost } from "../chains/bifrost";

export const provideDefaults = () => {
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
};
