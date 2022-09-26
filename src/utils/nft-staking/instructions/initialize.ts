import * as anchor from '@project-serum/anchor'
import BN from 'bn.js'
import * as keys from '../keys'

import { 
  PublicKey, 
  Connection,
  SYSVAR_RENT_PUBKEY,
  Transaction
} from '@solana/web3.js'

import { getProgram } from '../program';
import * as Constants from '../constants';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  NFT_VERIFIED_CREATOR
} from "../../ids";
import {
  findAssociatedTokenAddress, sendTransaction
} from "../../web3";


export async function w3_initializeProgram({
  connection,
  wallet
} :initParams) : Promise<string>
{
  const program = getProgram(connection, wallet);
  const globalStateKey = await keys.getGlobalStateKey();

  const transaction = new Transaction();
  transaction.add(await program.methods
    .initialize(wallet.publicKey, new PublicKey(NFT_VERIFIED_CREATOR))
    .accounts({
      authority: wallet.publicKey,
      globalState: globalStateKey,
      systemProgram: SYSTEM_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction());
  const txHash = await sendTransaction(connection, wallet, transaction, [])
  return txHash;
}

interface initParams {
  connection: Connection,
  wallet: any
}