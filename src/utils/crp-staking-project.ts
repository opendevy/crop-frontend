// @ts-ignore
import * as anchor from '@project-serum/anchor';

// @ts-ignore
import * as serumCmn from "@project-serum/common";

import { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
const { BN, web3, Program, AnchorProvider } = anchor
const { PublicKey, SystemProgram, Keypair, Transaction } = web3
const utf8 = anchor.utils.bytes.utf8;

function getNumber (num: number) {
  return new BN(num * 10 ** 9)
}

const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
}

import idl_file from '@/utils/crp-staking-project-idl.json'
import { Account, Connection } from '@solana/web3.js';
import { createSplAccount } from './crp-swap';
import { createAssociatedTokenAccountIfNotExist2, sendTransaction } from './web3';
import { STAKE_PROJECT_PROGRAM_ID } from './ids';
import moment from 'moment';

export function getProgram(
  connection: Connection,
  wallet: any,
) {

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions(),
  );
  // Generate the program client from IDL.
  const program = new (anchor as any).Program(idl_file, new PublicKey(STAKE_PROJECT_PROGRAM_ID), provider);
  return program;

}

export async function getStateKey(){
  const [stateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('state')],
    new PublicKey(STAKE_PROJECT_PROGRAM_ID)
  );
  return stateKey
}

export async function getPoolKeyByMint(mint:string | anchor.web3.PublicKey){
  const res = await anchor.web3.PublicKey.findProgramAddress(
    [new PublicKey(mint).toBuffer()],
    new PublicKey(STAKE_PROJECT_PROGRAM_ID)
  );
  return res
}
export async function getPoolVaultKeyByMint(mint:string | anchor.web3.PublicKey){
  const [poolSigner] = await getPoolKeyByMint(mint);
  const [poolVault] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('pool-vault'), poolSigner.toBuffer()],
    new PublicKey(STAKE_PROJECT_PROGRAM_ID)
  );
  return poolVault
}

export async function getRewardVaultKeyByMint(mint:string | anchor.web3.PublicKey){
  const [poolSigner] = await getPoolKeyByMint(mint);
  const [rewardVault] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('reward-vault'), poolSigner.toBuffer()],
    new PublicKey(STAKE_PROJECT_PROGRAM_ID)
  );
  return rewardVault
}

export async function getUserKeyByMint(mint:string | anchor.web3.PublicKey, user: string | anchor.web3.PublicKey){
  const [poolSigner] = await getPoolKeyByMint(mint);
  const [userSigner] = await anchor.web3.PublicKey.findProgramAddress(
    [poolSigner.toBuffer(), new anchor.web3.PublicKey(user).toBuffer()],
    new PublicKey(STAKE_PROJECT_PROGRAM_ID)
  );
  return userSigner
}


export async function createFarmState(
  connection:Connection,
  wallet: any,
)
{
  const program = await getProgram(connection, wallet);

  const stateSigner = await getStateKey();
  const txHash = await program.rpc.createState({
    accounts: {
      state: stateSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })
  console.log(txHash);
  // return await sendTransaction(connection, wallet, transaction, [])
  return txHash;
}

export async function createPool(
  connection:Connection,
  wallet: any,
  mint: string| anchor.web3.PublicKey,
  lockDuration: number,
  tokenPerSecond: number,
)
{
  const program = await getProgram(connection, wallet);
 
  const stateSigner = await getStateKey();
  const [poolSigner, poolBump] = await getPoolKeyByMint(mint);
  const poolVault = await getPoolVaultKeyByMint(mint);
  const rewardVault = await getRewardVaultKeyByMint(mint);
  console.log(poolSigner.toString());

  const txHash =  await program.rpc.createPool(poolBump, new BN(lockDuration), new BN(tokenPerSecond), {
    accounts: {
      state: stateSigner,
      pool: poolSigner,
      mint: mint,
      poolVault: poolVault,
      rewardVault: rewardVault,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })
  console.log(txHash);
  // return await sendTransaction(connection, wallet, transaction, [])
  return txHash;
}

export async function changeTokenPerSecond(
  connection:Connection,
  wallet: any,
  mint: string,
  tokenPerSecond: number
){
  const program = await getProgram(connection, wallet);
 
  const stateSigner = await getStateKey();
  const [poolSigner, poolBump] = await getPoolKeyByMint(mint);

  const txHash = await program.rpc.changeTokensPerSecond(new BN(tokenPerSecond), {
    accounts: {
      state: stateSigner,
      pool: poolSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })

  console.log(txHash);
  // return await sendTransaction(connection, wallet, transaction, signers)
}
export async function changeLockDuration(
  connection:Connection,
  wallet: any,
  mint: string,
  lockDuration: number
){
  const program = await getProgram(connection, wallet);
 
  const stateSigner = await getStateKey();
  const [poolSigner, poolBump] = await getPoolKeyByMint(mint);

  const txHash = await program.rpc.changeLockDuration(new BN(lockDuration), {
    accounts: {
      state: stateSigner,
      pool: poolSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })
  console.log(txHash);

  // return await sendTransaction(connection, wallet, transaction, signers)
}

export async  function  fundToProgram(
  connection:Connection,
  wallet: any,
  mint: string,
  fundTokenAccount:string,
  amount:any
) {

  const program = await getProgram(connection, wallet);

  const stateSigner = await getStateKey()
  const [poolSigner, poolBump] = await getPoolKeyByMint(mint);
  const rewardVault = await getRewardVaultKeyByMint(mint);

  const txHash = await program.rpc.fundRewardToken(new BN(amount), {
    accounts: {
      state: stateSigner,
      pool: poolSigner,
      rewardVault: rewardVault,
      userVault: fundTokenAccount,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })

  console.log(txHash);
  // return await sendTransaction(connection, wallet, transaction, signers)
}

export async function getFarmState(connection: any, wallet: any){
  const program = await getProgram(connection, wallet);
  const stateSigner = await getStateKey();
  return await program.account.stateAccount.fetch(stateSigner)
}

export async function getAllPools(connection: any, wallet: any){
  const program = await getProgram(connection, wallet);
  const pools = await program.account.farmPoolAccount.all()
  return pools
}
export async function getPoolInfoByMint(connection: any, wallet: any, mint: string | anchor.web3.PublicKey){
  const program = await getProgram(connection, wallet);
  const [poolSigner] = await getPoolKeyByMint(mint);
  
  const pool = await program.account.farmPoolAccount.fetch(poolSigner);
  return pool
}

export async function getUserState(connection: any, wallet: any, mint: string | anchor.web3.PublicKey){

  try {
    const program = await getProgram(connection, wallet);
    const userSigner = await getUserKeyByMint(mint, wallet.publicKey)
    const user = await program.account.stakeUserAccount.fetch(userSigner);
    return user
  }
  catch (error) {
    return null;
  }
}

export async function stake (
  connection:Connection,
  wallet: any,

  mint: string,

  userToken: string,

  amount:any, 
) {
  const program = await getProgram(connection, wallet);

  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getStateKey()

  const [poolSigner] = await getPoolKeyByMint(mint)
  const poolVault = await getPoolVaultKeyByMint(mint);

  const userSigner = await getUserKeyByMint(mint, wallet.publicKey)
  console.log("Staking", amount);
  try{
    await program.account.stakeUserAccount.fetch(userSigner)
  }
  catch
  {
    console.log("You are the new user to stake")
    transaction.add( program.instruction.createUser( {
      accounts: {
        user: userSigner,
        state: stateSigner,
        pool: poolSigner,
        authority: wallet.publicKey,
        ...defaultAccounts
      }
    }));
  }

  transaction.add(program.instruction.stake(new BN(amount), {
    accounts: {
      user: userSigner,
      state: stateSigner,
      pool: poolSigner,
      poolVault: poolVault,
      userVault: userToken,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }));
  const txHash = await sendTransaction(connection, wallet, transaction, signers)
  console.log('stake tx', txHash);
  return txHash
}
export async function unstake (
  connection:Connection,
  wallet: any,

  mint: string,

  userToken: any,

  amount:any, 
) {
  const program = await getProgram(connection, wallet);

  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getStateKey()

  const [poolSigner] = await getPoolKeyByMint(mint)
  const poolVault = await getPoolVaultKeyByMint(mint);
  const rewardVault = await getRewardVaultKeyByMint(mint);

  const userSigner = await getUserKeyByMint(mint, wallet.publicKey)
  
  const userTokenVault = await createAssociatedTokenAccountIfNotExist2(
    userToken,
    wallet.publicKey,
    wallet.publicKey,
    mint,
    transaction
  )
  console.log('unstaking', amount);
  transaction.add(program.instruction.unstake(new BN(amount), {
    accounts: {
      user: userSigner,
      state: stateSigner,
      pool: poolSigner,
      poolVault: poolVault,
      userVault: userTokenVault,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }));
  transaction.add(program.instruction.harvest( {
    accounts: {
      user: userSigner,
      state: stateSigner,
      pool: poolSigner,
      rewardVault: rewardVault,
      userVault: userTokenVault,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }));

  const txHash = await sendTransaction(connection, wallet, transaction, signers)
  console.log('unstake tx', txHash);
  return txHash
}

export async function harvest (
  connection:Connection,
  wallet: any,

  mint: string,

  userToken: any,

) {

  const program = await getProgram(connection, wallet);

  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getStateKey()

  const [poolSigner] = await getPoolKeyByMint(mint)
  const rewardVault = await getRewardVaultKeyByMint(mint);

  const userSigner = await getUserKeyByMint(mint, wallet.publicKey)
  
  const userTokenVault = await createAssociatedTokenAccountIfNotExist2(
    userToken,
    wallet.publicKey,
    wallet.publicKey,
    mint,
    transaction
  )
  transaction.add(program.instruction.harvest( {
    accounts: {
      user: userSigner,
      state: stateSigner,
      pool: poolSigner,
      rewardVault: rewardVault,
      userVault: userTokenVault,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }));

  const txHash = await sendTransaction(connection, wallet, transaction, signers)
  console.log('harvest', txHash);
  return txHash
}


const ACC_PRECISION = new BN(100 * 1000 * 1000 * 1000);
export function estimateRewards(
  poolData:any,
  userData:any,
){
  const currentTimeStamp = Math.ceil(new Date().getTime() / 1000);

  const duration = new BN(Math.max(currentTimeStamp - poolData.lastRewardTime, 0))

  const available_reward = BN.min(poolData.tokenPerSecond.mul(duration), poolData.remainReward);

  const reward_per_share = available_reward.mul(ACC_PRECISION).div(poolData.amount);

  const acc_reward_per_share = poolData.accRewardPerShare.add(reward_per_share);

  const pending_amount = userData.amount.mul( acc_reward_per_share).div(ACC_PRECISION).sub(userData.rewardDebt);
  const total_reward = userData.rewardAmount.add(pending_amount)

  return total_reward.toString()
}


export function estimateRewardsPerSec(
  poolData:any,
  userData:any,
){
  const currentTimeStamp = Math.ceil(new Date().getTime() / 1000);

  const duration = new BN(Math.max(currentTimeStamp - poolData.lastRewardTime, 0))

  const available_reward = BN.min(poolData.tokenPerSecond.mul(duration), poolData.remainReward);
  const reward_per_share = available_reward.mul(ACC_PRECISION).div(poolData.amount);

  const acc_reward_per_share = poolData.accRewardPerShare.add(reward_per_share);

  const pending_amount = userData.amount.mul( acc_reward_per_share).div(ACC_PRECISION).sub(userData.rewardDebt);
  const total_reward = userData.rewardAmount.add(pending_amount)
  return ((total_reward / 1000000000) / ((currentTimeStamp - poolData.lastRewardTime.toString()) * 1000));
}

