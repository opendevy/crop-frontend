// @ts-ignore
import * as anchor from '@project-serum/anchor';
import bs58 from 'bs58';
// @ts-ignore
import * as serumCmn from "@project-serum/common";

import { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
const { BN, web3, Program, AnchorProvider } = anchor
const { SystemProgram, Keypair, Transaction, LAMPORTS_PER_SOL } = web3
const utf8 = anchor.utils.bytes.utf8;

const LAUNCHPAD_TAG = "launchpad";
const USER_TAG = "user";
const PROJECT_TAG = "project";
const PROJECT_VAULT_TAG = "project-vault";
const TREASURY_VAULT_TAG = "treasury-vault";
const USER_PROJECT_TOKEN_TAG = "user-project-token";

const stakingProgramId = new PublicKey(STAKE_TIERS_PROGRAM_ID)

const stakingPoolId = new PublicKey(STAKE_TIERS_POOL_ID)


function getNumber (num: number) {
  return new BN(num * 10 ** 9)
}

import launchpad_idl from '@/utils/crp-launchpad-idl.json'

import { NATIVE_SOL, TOKENS, getTokenByMintAddress } from './tokens'
import { cloneDeep, get } from 'lodash-es'
import { createAtaSolIfNotExistAndWrap, createTokenAccountIfNotExist, createSyncNativeInstruction } from '@/utils/web3'
import { Account, Connection, PublicKey, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY} from '@solana/web3.js';
import { LAUNCHPAD_PROGRAM_ID, NFT_STAKING_PROGRAM_ID, STAKE_TIERS_POOL_ID, STAKE_TIERS_PROGRAM_ID } from './ids';
import { closeAccount } from '@project-serum/serum/lib/token-instructions'
import moment from 'moment';
import { sendTransaction } from './web3';
let LaunchpadProgram:any = null

export function setAnchorProvider(
  connection: Connection,
  wallet: any,
) {
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions(),
  );
  // Generate the program client from IDL.
  const program = new (anchor as any).Program(launchpad_idl, new PublicKey(LAUNCHPAD_PROGRAM_ID), provider);
  LaunchpadProgram = program
}

export async function getLaunchpad(){
  const launchpadAddress = await getLaunchpadAddress();
  try{
    const data = await LaunchpadProgram.account.launchpadAccount.fetch(launchpadAddress)
    return data
  }
  catch{

  }
  return null
}

export async function getProject(mint: string){
  const projectAddress = await getProjectAddress(new PublicKey(mint));
  const data = await LaunchpadProgram.account.projectAccount.fetch(projectAddress)
  return data
}

export async function getProjectFormatted(mint: string){
    const data = await getProject(mint)

    return {
      date_preparation: time2str(data.prepareDate),
      date_whitelist_start: time2str(data.wlStartDate),
      date_whitelist_end: time2str(data.wlEndDate),
      date_sale_start: time2str(data.saleStartDate),
      date_sale_end: time2str(data.saleEndDate),
      date_distribution: time2str(data.distributionDate),
      token_price: data.tokenPrice.toString(),
      pool_size: data.poolSize.toString(),
      first_liberation: data.firstLiberation.toString(),
      price_token_mint: data.saleMint.toString(),
      
      total_deposit_amount:  data.depositAmount.toString(),
      total_paid_amount:  data.paidAmount.toString(),
      total_claimed_amount:  data.claimedAmount.toString(),
      total_registered_user:  data.subscribed.toString(),

      max_allocation:  [ 
        new Number(data.maxAllocTier0.toString()), 
        new Number(data.maxAllocTier1.toString()),
        new Number(data.maxAllocTier2.toString()),
        new Number(data.maxAllocTier3.toString()),
        new Number(data.maxAllocTier4.toString()),
        new Number(data.maxAllocTier5.toString())
      ]
    }
  return {}
}


const datetime_format = 'YYYY-MM-DD HH:mm:ss'
function str2time(date:string){
  return new BN(moment(date, datetime_format).format("X"))
}

function time2str(date: any){
  return moment(new Date(date * 1000)).format(datetime_format)
}

function formatProjectParams(
  prepareDate: any,
  whiltelistStartDate: any,
  whiltelistEndDate: any,
  saleStartDate: any,
  saleEndDate: any,
  distributionDate: any,
  
  // max_allocs: any[],

  tokenPrice: any,
  poolSize: any,
  firstLiberation: any,
){
  return [
    str2time(prepareDate),
    str2time(whiltelistStartDate),
    str2time(whiltelistEndDate),
    str2time(saleStartDate),
    str2time(saleEndDate),
    str2time(distributionDate),
    
    // max_allocs.map(function(ele){ return new BN(ele)}),
    
    new BN(Math.ceil(tokenPrice)),
    new BN(poolSize),
    new BN(firstLiberation),
  ]
}

export async function subscribeToWhitelist(
  connection:Connection,
  wallet: any,
  projectMint: PublicKey,
  referal: any = ''
) {
  const transaction = new Transaction()
  const signers: Account[] = []

  const launchpadKey = await getLaunchpadAddress();
  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  const stakingUserKey = await getStakingUserKey(wallet.publicKey);
  const nftStakingState = await getNftStakingStateKey(wallet.publicKey);

  transaction.add(LaunchpadProgram.instruction.registerUser(
    {
      accounts: {
        launchpad: launchpadKey,
        authority: wallet.publicKey,
        project: projectKey,
        user: userKey,
        stakingState: stakingUserKey,
        nftStakingState: nftStakingState,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  ));
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function getUpdateUserTierIx(
  wallet: any,
  projectMint: PublicKey,
) {
  const launchpadKey = await getLaunchpadAddress();
  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  const stakingUserKey = await getStakingUserKey(wallet.publicKey);
  const nftStakingState = await getNftStakingStateKey(wallet.publicKey);

  let txid = LaunchpadProgram.instruction.updateUserTier(
    {
      accounts: {
        launchpad: launchpadKey,
        project: projectKey,
        authority: wallet.publicKey,
        user: userKey,
        stakingState: stakingUserKey,
        nftStakingState: nftStakingState,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  );

  return txid;
}

export const getUserTier = async (
  wallet: any,
  projectMint: PublicKey,
) => {
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  const userData = await LaunchpadProgram.account.userAccount.fetch(userKey);
  let tierHash = getHashStr(Uint8Array.from(userData.tierHash));
  return { tierHash, tier: userData.tier }
}

export const isSubscribed = async (
  wallet: any,
  projectMint: PublicKey,
) => {
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  let userData = null;
  try {
    userData = await LaunchpadProgram.account.userAccount.fetch(userKey);
  } catch {}
  return userData !== null;
}

export const getUserDatas = async (
  wallet: any,
  projectMint: PublicKey,
) => {
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  let userData = null;
  try {
    userData = await LaunchpadProgram.account.userAccount.fetch(userKey);
    userData.hashStr = getHashStr(userData.tierHash)
  } catch {}
  return userData;
}

export async function buyTokens(
  connection: Connection,
  wallet: any,
  projectMint: PublicKey,
  userSaleTokenAccount: PublicKey,
  amount: any,
  hashStr: string,
  fromSOL: boolean = false
) {
  const transaction = new Transaction()
  const signers: Account[] = []
  const payableAmount = new anchor.BN(amount)  
  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  const treasuryVault = await getTreasuryVaultKey(projectKey);

  const hashArr = getHashArr(hashStr);
  transaction.add(LaunchpadProgram.instruction.pay(
    payableAmount,
    hashArr,
    {
      accounts: {
        project: projectKey,
        user: userKey,
        treasuryVault,
        userVault: userSaleTokenAccount,
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  ));
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function buyTokensFromSOL(
  connection:Connection,
  wallet: any,
  projectMint: PublicKey,
  amount:any,
  hashStr: string,
) {

  const transaction = new Transaction()
  const signers: Account[] = []
  const owner = wallet.publicKey

  const payableAmount = new anchor.BN(amount)

  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  const treasuryVault = await getTreasuryVaultKey(projectKey);

  let wrappedCoinSolAccount
  wrappedCoinSolAccount = await createTokenAccountIfNotExist(
      connection,
      wrappedCoinSolAccount,
      owner,
      TOKENS.WSOL.mintAddress,
      amount + 1e7,
      transaction,
      signers
  )
  console.log(wrappedCoinSolAccount);
  transaction.add(
    createSyncNativeInstruction(TOKEN_PROGRAM_ID, wrappedCoinSolAccount)
  );
  
  const hashArr = getHashArr(hashStr);
  transaction.add(LaunchpadProgram.instruction.pay(
    payableAmount,
    hashArr,
    {
      accounts: {
        project: projectKey,
        user: userKey,
        treasuryVault,
        userVault: new PublicKey(wrappedCoinSolAccount),
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  ));

  if (wrappedCoinSolAccount) {
    transaction.add(
      closeAccount({
        source: wrappedCoinSolAccount,
        destination: owner,
        owner: owner
      })
    )
  }
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function claimTokens(
  connection:Connection,
  wallet: any,
  projectMint: PublicKey
) {
  const transaction = new Transaction()
  const signers: Account[] = []

  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserKey(wallet.publicKey, projectMint);
  const projectVaultKey = await getProjectVaultKey(projectKey);

  const userProjectToken = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    projectMint,
    wallet.publicKey
  );
  transaction.add(LaunchpadProgram.instruction.claimProjectToken(
    {
      accounts: {
        project: projectKey,
        user: userKey,
        projectVault: projectVaultKey,
        userProjectToken,
        projectMint,
        authority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  ));
  return await sendTransaction(connection, wallet, transaction, signers)
}


export async function getLaunchpadAddress(){
  const [launchpad, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('launchpad')],
    LaunchpadProgram.programId
  );
  return launchpad
}

export async function getProjectAddress(mint: anchor.web3.PublicKey){
  const [project, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('project'), mint.toBuffer() ],
    LaunchpadProgram.programId
  );
  return project
}

const getTreasuryVaultKey = async (
  projectKey: PublicKey
) => {
  const [treasuryKey] = 
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(TREASURY_VAULT_TAG), projectKey.toBuffer()],
      LaunchpadProgram.programId,
    );
  return treasuryKey;
}

const getProjectVaultKey = async (
  projectKey: PublicKey
) => {
  const [projectVaultKey] = 
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(PROJECT_VAULT_TAG), projectKey.toBuffer()],
      LaunchpadProgram.programId,
    );
  return projectVaultKey;
}

const getUserKey = async (
  wallet: PublicKey,
  projectMintKey: PublicKey
) => {
  const [userKey] = 
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(USER_TAG), wallet.toBuffer(), projectMintKey.toBuffer()],
      LaunchpadProgram.programId,
    );
  return userKey;
}

const getStakingUserKey = async (
  wallet: PublicKey
) => {
  const [stakingUserKey] = 
    await anchor.web3.PublicKey.findProgramAddress(
      [stakingPoolId.toBuffer(), wallet.toBuffer()],
      stakingProgramId,
    );
  return stakingUserKey;
}

const getNftStakingStateKey = async (
  wallet: PublicKey
) => {
  const [stateKey] = 
  await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("USER_STATE_SEED"), wallet.toBuffer()],
    new PublicKey(NFT_STAKING_PROGRAM_ID),
  );
return stateKey;
}

export const getHashArr = (hashStr: string) => {
  let arrHash = [];
  if (hashStr.length !== 64) {
    for(let i = 0; i < 32; i ++) arrHash[i] = 0;
    return arrHash;
  }
  for (let i = 0; i < hashStr.length; i += 2) {
    arrHash.push(parseInt('0x' + hashStr.slice(i, i + 2)));
  }
  return arrHash;
}

const getHashStr = (hashArray: any) => {
  let hashStr = "";
  hashArray.forEach((el: any) => {
    let elString = el.toString(16);
    if (elString.length < 2) elString = '0' + elString;
    hashStr += elString;
  });
  return hashStr;
}
