import { PublicKey } from "@solana/web3.js";
import {
  GLOBAL_STATE_SEED,
  USER_STATE_SEED,
  MetadataProgramId
} from "./constants";

import { NFT_STAKING_PROGRAM_ID } from '../ids'
export const getGlobalStateKey = async () => {
  const [globalStateKey] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_SEED)],
    new PublicKey(NFT_STAKING_PROGRAM_ID)
  );
  return globalStateKey;
};

export const getUserStateKey = async (userKey: PublicKey) => {
  const [userStateKey] = await PublicKey.findProgramAddress(
    [Buffer.from(USER_STATE_SEED), userKey.toBuffer()],
    new PublicKey(NFT_STAKING_PROGRAM_ID)
  );
  return userStateKey;
};

export async function getMetadataKey(
  tokenMint: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey(MetadataProgramId).toBuffer(),
        tokenMint.toBuffer(),
      ],
      new PublicKey(MetadataProgramId)
    )
  )[0];
}