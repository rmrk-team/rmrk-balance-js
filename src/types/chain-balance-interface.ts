import { Observable } from "rxjs";
import { Balance } from "./balance";

export interface ChainBalance<C> {
  provideContext: (context: C) => void;
  balance$: (address: string) => Observable<Balance>;
}
