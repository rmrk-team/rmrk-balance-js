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

const assetId = "RMRK";
const api$ = new ReplaySubject<ApiPromise>();

export const provideApi = (api: ApiPromise) => api$.next(api);

export const balance$ = (address: string) => {
  return combineLatest([api$, of(address)]).pipe(
    mergeMap(([api, address]) => {
      return fromEventPattern<Balance>(
        (handler) => {
          return api.query.tokens.accounts(
            address,
            { Token: assetId },
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
  const payload = await api.query.tokens.accounts(address, { Token: assetId });
  return decodeBalance(payload);
};

const decodeBalance = (payload: any): Balance => {
  return {
    balance: BigInt(payload.free.toString()),
  };
};
