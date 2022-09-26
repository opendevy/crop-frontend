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
  SYSTEM_PROGRAM_ID
} from "../../ids";
import {
  findAssociatedTokenAddress, sendTransaction
} from "../../web3";
import {
  Token
} from "@solana/spl-token";
import { fetchUserState } from '../fetch';
import { createUserStateInstruction } from './createUserState';


export async function w3_unStakeNft({
  connection,
  wallet,
  nftMints
} : unstakeNftParams) : Promise<string>
{
  const program = getProgram(connection, wallet);
  const globalStateKey = await keys.getGlobalStateKey();

  const transaction = new Transaction();

  const userStateKey = await keys.getUserStateKey(wallet.publicKey);
  if (!await fetchUserState(program, userStateKey)) {
    throw new Error("NFT is not staked");
  }

  await Promise.all(nftMints.map(async nftMint => {
    const userNftAta = await findAssociatedTokenAddress(wallet.publicKey, nftMint);
    const poolNftAta = await findAssociatedTokenAddress(globalStateKey, nftMint);
  
    if (!(await program.provider.connection.getAccountInfo(poolNftAta))) {
      throw new Error("No NFT in pool");
    }
    
    transaction.add(await program.methods
      .unstakeNft()
      .accounts({
        user: wallet.publicKey,
        globalState: globalStateKey,
        userState: userStateKey,
        poolNftAta,
        userNftAta,
        nftMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction());
  }));
  const txHash = await sendTransaction(connection, wallet, transaction, [])
  return txHash;
}

interface unstakeNftParams {
  connection: Connection,
  wallet: any,
  nftMints: PublicKey[],
}