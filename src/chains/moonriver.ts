import { ApiPromise } from "@polkadot/api";
import { Codec } from "@polkadot/types-codec/types";
import {
  combineLatest,
  firstValueFrom,
  fromEventPattern,
  mergeMap,
  of,
  ReplaySubject,
} from "rxjs";
import { Balance } from "../types/balance";

const assetId = "182365888117048807484804376330534607370";
const api$ = new ReplaySubject<ApiPromise>();

export const provideApi = (api: ApiPromise) => api$.next(api);

export const balance$ = (address: string) => {
  return combineLatest([api$, of(address)]).pipe(
    mergeMap(([api, address]) => {
      return fromEventPattern<Balance>(
        (handler) => {
          const assetIdU128 = api.createType("U128", assetId);
          return api.query.assets.account(
            assetIdU128,
            address,
            (payload: Codec) => {
              handler(decodeBalance(payload));
            }
          );
        },
        (_, unsubscribe: Promise<() => void>) => {
          unsubscribe.then((u) => u());
        }
      );
    })
  );
};

export const balance = async (address: string) => {
  const api = await firstValueFrom(api$);
  const assetIdU128 = api.createType("U128", assetId);
  const payload = await api.query.assets.account(assetIdU128, address);
  return decodeBalance(payload);
};

const decodeBalance = (payload: any): Balance => {
  return {
    balance: BigInt(payload.balance.toString()),
  };
};
