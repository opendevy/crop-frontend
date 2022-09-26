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
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'


export async function w3_stakeNft({
  connection,
  wallet,
  nftMints
} : stakeNftParams) : Promise<string>
{
  const program = getProgram(connection, wallet);
  const globalStateKey = await keys.getGlobalStateKey();

  const transaction = new Transaction();

  const userStateKey = await keys.getUserStateKey(wallet.publicKey);
  if (!await fetchUserState(program, userStateKey)) {
    const createUserStateIx = await createUserStateInstruction(
      program, wallet.publicKey, wallet.publicKey, userStateKey
    );
    transaction.add(createUserStateIx);
  }

  await Promise.all(nftMints.map(async nftMint => {
    const userNftAta = await findAssociatedTokenAddress(wallet.publicKey, nftMint);

    const poolNftAta = await findAssociatedTokenAddress(globalStateKey, nftMint);

    if (!(await program.provider.connection.getAccountInfo(poolNftAta))) {
      transaction.add(Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        nftMint,
        poolNftAta,
        globalStateKey,
        wallet.publicKey,
      ));
    }
    const metadataKey = await keys.getMetadataKey(nftMint);
    let mdt = await connection.getAccountInfo(metadataKey);
    //@ts-ignore
    let metadataInfo = await Metadata.fromAccountInfo(mdt)[0];

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: metadataInfo.data.name.replace(/\0/g, '') })
    }

    let responseData

    try {
      responseData = await fetch('https://flow.cropper.finance/nft/', requestOptions).then((res) => res.json())
    } catch {
      // dummy data
      throw 'Error'
    }

    if(!responseData.expect || !responseData.hash_str){
      throw 'Error'
    }

    //@Phoon here is a return exemple : 
    //  {
    //      "expect": "Primitive",
    //      "hash_str": "92c20718b8d9f00a26548215e3380f414da38c63f6a8282939cb0a383a627028",
    //      "base_hash_str": "Cropper Potion #10pr1mitv"
    //  }

    console.log('NFT TYPE', responseData.expect)
    console.log('Hash String', responseData.hash_str)

    let arrHash = [];
    if (responseData.hash_str.length !== 64) {
      for(let i = 0; i < 32; i ++) arrHash[i] = 0;
      return arrHash;
    }
    for (let i = 0; i < responseData.hash_str.length; i += 2) {
      arrHash.push(parseInt('0x' + responseData.hash_str.slice(i, i + 2)));
    }

    transaction.add(await program.methods
      .stakeNft(arrHash, responseData.expect)
      .accounts({
        user: wallet.publicKey,
        globalState: globalStateKey,
        userState: userStateKey,
        poolNftAta,
        userNftAta,
        nftMint,
        nftMetadata: metadataKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction());
  }))
  
  const txHash = await sendTransaction(connection, wallet, transaction, [])
  return txHash;
}

interface stakeNftParams {
  connection: Connection,
  wallet: any,
  nftMints: PublicKey[],
}