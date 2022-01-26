import { ApiPromise } from "@polkadot/api";
import { KARURA_ASSET_ID } from "..";
import * as A from "../types/address";
import * as N from "../types/network-balance";

export const karura: N.NetworkBalance<ApiPromise, A.Type.SS58> = N.implement({
  addressType: A.Type.SS58,
  read: async (api, address) => {
    return api.query.tokens.accounts(address, {
      ForeignAsset: KARURA_ASSET_ID,
    });
  },
  stream: async (api, address, cb) => {
    return api.query.tokens.accounts(
      address,
      { ForeignAsset: KARURA_ASSET_ID },
      cb
    );
  },
  decode: (payload: any) => {
    return {
      balance: BigInt(payload.free.toString()),
    };
  },
});
