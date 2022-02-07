import {
  combineLatest,
  firstValueFrom,
  fromEventPattern,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  throwError,
} from "rxjs";
import { Balance } from ".";
import * as A from "./address";

export type NetworkBalance<C, AT extends A.Type> = {
  provideContext: (context: C | Promise<C>) => Promise<NetworkBalance<C, AT>>;
  balance$: (address: string) => Observable<Balance>;
  balance: (address: string) => Promise<Balance>;
};

export type NetworkImpl<C, AT extends A.Type> = {
  addressType: AT;
  read: (context: C, address: string) => Promise<unknown>;
  stream: (
    context: C,
    address: string,
    cb: (value: unknown) => void
  ) => Promise<unknown>;
  decode: (payload: unknown) => Balance;
};

export const implement = <C, AT extends A.Type>(
  impl: NetworkImpl<C, AT>
): NetworkBalance<C, AT> => {
  const context$ = new ReplaySubject<C>();

  return {
    async provideContext(context: C | Promise<C>) {
      context$.next(await context);
      return this;
    },
    async balance(address: string) {
      A.assert(impl.addressType, address);
      const api = await firstValueFrom(context$);
      const value = await impl.read(api, address);
      return impl.decode(value);
    },
    balance$(address: string) {
      return combineLatest([context$, of(A.wrap(address))]).pipe(
        mergeMap(([context, address]) => {
          if (A.FormatError.is(address)) return throwError(() => address);

          if (!A.is(impl.addressType, address))
            return throwError(
              () =>
                new A.FormatError(
                  `Expected address of type ${impl.addressType}`
                )
            );

          return fromEventPattern<Balance>(
            (cb) => {
              return impl.stream(context, address.raw, (value) => {
                cb(impl.decode(value));
              });
            },
            (_, unsubscribe: Promise<() => void>) => {
              unsubscribe.then((u) => u());
            }
          );
        })
      );
    },
  };
};
