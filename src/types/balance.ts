import { formatBalance } from "@polkadot/util";
import { TOKEN_DECIMALS } from "../constants";

export type Balance = {
  balance: bigint;
};

export const empty = (): Balance => {
  return {
    balance: BigInt(0),
  };
};

export const concat = (...balances: Balance[]) => {
  return balances.reduce(
    (acc, next) => {
      return {
        balance: acc.balance + next.balance || BigInt(0),
      };
    },
    { balance: BigInt(0) }
  );
};

export const format = (balance: Balance) =>
  formatBalance(
    balance.balance,
    { withSi: false, forceUnit: "-" },
    TOKEN_DECIMALS
  );
