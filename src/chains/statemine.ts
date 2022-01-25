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

const assetId = 8;
const api$ = new ReplaySubject<ApiPromise>();

export const provideApi = async (api: ApiPromise | Promise<ApiPromise>) =>
  api$.next(await api);

export const balance$ = (address: string) => {
  return combineLatest([api$, of(address)]).pipe(
    mergeMap(([api, address]) => {
      return fromEventPattern<Balance>(
        (handler) => {
          return api.query.assets.account(
            assetId,
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
  const payload = await api.query.assets.account(assetId, address);
  return decodeBalance(payload);
};

const decodeBalance = (payload: any): Balance => {
  return {
    balance: BigInt(payload.balance.toString()),
  };
};
