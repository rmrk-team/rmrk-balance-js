import { isAddress as isEthAddress } from '@ethersproject/address';
import isError from "@stdlib/assert-is-error";
import { isValidSubstrateAddress } from "../lib/isSubstrateAddress";

export type Address<T extends Type> = {
  type: T;
  raw: string;
};

export const enum Type {
  SS58 = "SS58",
  ETH = "ETH",
}

export class FormatError extends Error {
  constructor(message: string) {
    super(message);
  }
  public static is(error: any): error is FormatError {
    return isError(error);
  }
}

export const is = <T extends Type>(
  t: T,
  address: Address<Type>
): address is Address<T> => {
  return address.type === t;
};

export const wrap = (address: string): Address<Type> | FormatError => {
  if (isEthAddress(address)) return { type: Type.ETH, raw: address };
  else if (isValidSubstrateAddress(address))
    return { type: Type.SS58, raw: address };
  else
    return new FormatError(
      `Could not wrapp address. Suplied value(${address}) is not one of the supported formats ${Type.ETH} | ${Type.SS58}`
    );
};

export const assert = (t: Type, address: string) => {
  const wrapped = wrap(address);
  if (FormatError.is(wrapped)) throw wrapped;
  if (!is(t, wrapped)) {
    throw new FormatError(
      `Address(${address}) was expected to be of type ${t}`
    );
  }
};
