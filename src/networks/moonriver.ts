import { ApiPromise } from "@polkadot/api";
import { MONRIVER_ASSET_ID } from "..";
import * as A from "../types/address";
import * as N from "../types/network-balance";

export const moonriver: N.NetworkBalance<ApiPromise, A.Type.ETH> = N.implement({
  addressType: A.Type.ETH,
  read: async (api, address) => {
    const assetIdU128 = api.createType("U128", MONRIVER_ASSET_ID);
    return api.query.assets.account(assetIdU128, address);
  },
  stream: async (api, address, cb) => {
    const assetIdU128 = api.createType("U128", MONRIVER_ASSET_ID);
    return api.query.assets.account(assetIdU128, address, cb);
  },
  decode: (payload: any) => {
    return {
      balance: BigInt(payload.balance.toString()),
    };
  },
});
