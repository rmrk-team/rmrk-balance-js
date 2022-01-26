import { ApiPromise } from "@polkadot/api";
import { STATEMINE_ASSET_ID } from "..";
import * as A from "../types/address";
import * as N from "../types/network-balance";

export const statemine = N.implement<ApiPromise, A.Type.SS58>({
  addressType: A.Type.SS58,
  read: async (api, address) => {
    return api.query.assets.account(STATEMINE_ASSET_ID, address);
  },
  stream: async (api, address, cb) => {
    return api.query.assets.account(STATEMINE_ASSET_ID, address, cb);
  },
  decode: (payload: any) => {
    return {
      balance: BigInt(payload.balance.toString()),
    };
  },
});
