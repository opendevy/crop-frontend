import {
  Connection,
  PublicKey
} from "@solana/web3.js";
import { BN, IdlAccounts } from "@project-serum/anchor";
import { NftStaking } from './idl/nft_staking';
import { getProgram } from "./program";
import BigNumber from "bignumber.js";
import { USDC_DECIMALS } from "./constants";
import * as keys from "./keys";

const DAY_IN_SECONDS = 60; // 24 * 60 * 60; // 1 minute
const LOCK_DURATION = 10 * DAY_IN_SECONDS;

const cvtDecimalBN2Number = (x: BN, decimals: number = USDC_DECIMALS): number => {
  return new BigNumber(x.toString()).div(Math.pow(10, decimals)).toNumber();
}

export const fetchData = async (program: any, type: string, key: PublicKey) => {
  return await program.account[type].fetchNullable(key);
};

export const fetchGlobalState = async (
  program: any,
  key: PublicKey
): Promise<IdlAccounts<NftStaking>["globalState"] | null> => {
  return await fetchData(program, "globalState", key);
};

export const fetchUserState = async (
  program: any,
  key: PublicKey
): Promise<IdlAccounts<NftStaking>["userState"] | null> => {
  return await fetchData(program, "userState", key);
};

export const fetchParsedUserState = async (
  connection: any,
  wallet: any
): Promise<IdlAccounts<NftStaking>["userState"] | null> => {
  const program = getProgram(connection, wallet);
  if (!wallet) return null;
  const userStateKey = await keys.getUserStateKey(wallet.publicKey);
  let userStateData = await fetchData(program, "userState", userStateKey);
  let result = {
    ...userStateData,
    endLockDate: userStateData.stakedTime.map((v: BN) => (v.toNumber() + LOCK_DURATION))
  };
  console.log("fetchParsedUserState result =", result);
  return result;
};


