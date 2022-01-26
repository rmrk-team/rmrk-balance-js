import { ApiPromise } from "@polkadot/api";
import { BIFROST_ASSET_ID } from "..";
import * as A from "../types/address";
import * as N from "../types/network";

export const bifrost = N.implement<ApiPromise, A.Type.SS58>({
  addressType: A.Type.SS58,
  read: async (api, address) => {
    return api.query.tokens.accounts(address, { Token: BIFROST_ASSET_ID });
  },
  stream: async (api, address, cb) => {
    return api.query.tokens.accounts(address, { Token: BIFROST_ASSET_ID }, cb);
  },
  decode: (payload: any) => {
    return {
      balance: BigInt(payload.free.toString()),
    };
  },
});
