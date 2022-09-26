import * as anchor from '@project-serum/anchor'

import { Connection, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID
} from "../../ids";
import { NftStaking } from '../idl/nft_staking'

export const createUserStateInstruction = async (
  program: anchor.Program<NftStaking>,
  userKey: PublicKey,
  payer: PublicKey,
  userStateKey: PublicKey
) => {
  
  return await program.methods
    .initUserState(userKey)
    .accounts({
      payer,
      userState: userStateKey,
      systemProgram: SYSTEM_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();
};