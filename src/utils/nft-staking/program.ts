import * as anchor from '@project-serum/anchor'
import { IDL, NftStaking } from './idl/nft_staking'
import { PublicKey, Connection } from '@solana/web3.js'
import { NFT_STAKING_PROGRAM_ID } from '../ids'

export function getProgram(connection: Connection, wallet: any, program = NFT_STAKING_PROGRAM_ID): anchor.Program<NftStaking> {
  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions())
  return new anchor.Program(IDL, new PublicKey(program), provider);
}