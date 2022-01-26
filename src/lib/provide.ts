import { ApiPromise, WsProvider } from "@polkadot/api";
import { statemine } from "../networks/statemine";
import { moonriver } from "../networks/moonriver";
import { karura } from "../networks/karura";
import { bifrost } from "../networks/bifrost";

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
