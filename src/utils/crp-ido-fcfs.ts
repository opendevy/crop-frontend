// @ts-ignore
import * as anchor from '@project-serum/anchor';
import bs58 from 'bs58';
// @ts-ignore
import * as serumCmn from "@project-serum/common";

import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
const { BN, web3, Program } = anchor
const { SystemProgram, Transaction } = web3
const utf8 = anchor.utils.bytes.utf8;

const STATE_TAG = 'FCFS_STATE_SEED'
const USER_TAG = 'FCFS_USER_SEED'
const PROJECT_TAG = 'FCFS_PROJECT_SEED'

const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
}

import idl from '@/utils/crp-ido-fcfs-idl.json'
import { Account, Connection, PublicKey} from '@solana/web3.js';
import { FCFS_PROGRAM_ID, NFT_STAKING_PROGRAM_ID} from './ids';
import moment from 'moment';
import { createSyncNativeInstruction, createTokenAccountIfNotExist, findAssociatedTokenAddress, sendTransaction } from './web3';
import { closeAccount, WRAPPED_SOL_MINT } from '@project-serum/serum/lib/token-instructions';
import { TOKENS, WRAPPED_SOL } from './tokens';

let program: any = null as any;

export function setAnchorProvider(
  connection: any,
  wallet: any
){
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions(),
  );
  program = new Program(idl as any, new PublicKey(FCFS_PROGRAM_ID), provider);
  
}


export async function getStateAddress(){
  const [stateKey] = await PublicKey.findProgramAddress(
    [Buffer.from(STATE_TAG)],
    program.programId
  );
  return stateKey
}

export async function getProjectAddress(mint: anchor.web3.PublicKey | string){
  const [projectKey] = await PublicKey.findProgramAddress(
    [Buffer.from(PROJECT_TAG), new PublicKey(mint).toBuffer()],
      program.programId
  );
  return projectKey
}


export const getUserDatas = async (
  wallet: any,
  projectMint: PublicKey,
) => {
  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserAddress(projectKey, wallet.publicKey);
  let userData = null;
  try {
    userData = await program.account.userAccount.fetch(userKey);
  } catch {}
  return userData;
}

export async function getProjectVaultAddress(mint: anchor.web3.PublicKey | string){
  const projectKey = await getProjectAddress(mint);
  const [projectVaultKey] = await PublicKey.findProgramAddress(
    [projectKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return projectVaultKey
}
export async function createState(
  connection:Connection,
  wallet: any,
  treasuryKey: any =  wallet.publicKey
) {
  const stateKey = await getStateAddress();
  let tx = await program.transaction.createState({
    accounts:{
      state: stateKey,
      treasury: treasuryKey,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })
  const txHash = await sendTransaction(connection, wallet, tx);
  console.log("txHash =", txHash);
  return txHash;
}

export async function getState(){
  const stateKey = await getStateAddress();
  try {
    const data = await program.account.stateAccount.fetch(stateKey)
    return data
  } catch(e) {
    console.log(e);
    return null
  }
}

export async function getUserAddress(projectKey: string | PublicKey, user: string | PublicKey){
  const [userKey] = await PublicKey.findProgramAddress(
    [Buffer.from(USER_TAG), new PublicKey(projectKey).toBuffer(), new PublicKey(user).toBuffer()],
      program.programId
  );
  return  userKey;
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

export async function getProject(mint: string){
  const projectAddress = await getProjectAddress(mint);
  try{
    const data = await program.account.projectAccount.fetch(projectAddress)
    return data
  }
  catch{

  }
  return null
}
export function formatProject2Params(data: any){
  const dataFormatted= {
    mint: data.projectMint.toString(),
    date_preparation: time2str(data.prepareDate),
    date_whitelist_start: time2str(data.wlStartDate),
    date_whitelist_end: time2str(data.wlEndDate),
    date_sale_start: time2str(data.saleStartDate),
    date_sale_end: time2str(data.saleEndDate),
    date_distribution: time2str(data.distributionDate),
    main_sale_mint: data.mainSaleMint.toString(),
    extra_sale_mint: data.extraSaleMint.toString(),
    token_price: data.tokenPrice.toString(),
    extra_rate: data.extraRate.toString(),
    max_allocation_per_user: data.maxAllocationPerUser.toString(),
    total_allocation: data.totalAllocation.toString(),

    first_liberation: data.firstLiberation.toString(),
    
    total_deposit_amount: data.projectTokenAmount.toString(),
    total_paid_amount: data.paidAmount.toString(),
    total_claimed_amount: data.claimedAmount.toString(),
    total_registered_user: data.subscribed.toString(),
  }
  return dataFormatted;
}

export async function getAllProjects(){
  const data = await program.account.projectAccount.all()
  const datas = data.map((item: any) => {
    const data = item.account;
    return formatProject2Params(data)
  })
  console.log(datas);
  return datas;
}

export async function getProjectFormatted(mint: string){
  try{
    const data = await getProject(mint) as any;
    return formatProject2Params(data);
  }
  catch{
  }
  return {}
}


const datetime_format = 'YYYY-MM-DD HH:mm:ss'
function str2time(date:string){
  return new BN(moment(date, datetime_format).format("X"))
}

export function time2str(date: any){
  return moment(new Date(date * 1000)).format(datetime_format)
}

function formartParams2Project(
  prepareDate: any,
  whiltelistStartDate: any,
  whiltelistEndDate: any,
  saleStartDate: any,
  saleEndDate: any,

  distributionDate: any,
  
  tokenPrice: any,
  extraRate: any,
  maxAllocationPerUser: any,
  totalAllocation: any,
  firstLiberation: any,
){
  const bnWlStart = str2time(whiltelistStartDate);
  const bnWlEnd = str2time(whiltelistEndDate);
  const bnSaleStart = str2time(saleStartDate);
  const bnSaleEnd = str2time(saleEndDate);

  const processPeriod = BN.min(bnWlEnd.sub(bnWlStart), bnSaleEnd.sub(bnSaleStart));
  return [
    str2time(prepareDate),
    bnWlStart,
    processPeriod,
    bnSaleStart,
    str2time(distributionDate),
    new BN(Math.ceil(tokenPrice)),
    new BN(Math.ceil(extraRate)),
    new BN(maxAllocationPerUser),
    new BN(totalAllocation),
    new BN(firstLiberation),
  ]
}

export async function saveProject(
  connection:Connection,
  wallet: any,

  projectMint: string,
  priceTokenMint: string,
  extraTokenMint: string,

  prepareDate: any,
  whiltelistStartDate: any,
  whiltelistEndDate: any,
  saleStartDate: any,
  saleEndDate: any,
  distributionDate: any,
  
  tokenPrice: any,
  extraRate: any,
  maxAllocationPerUser: any,
  totalAllocation: any,
  firstLiberation: any,
)
{
  console.log(firstLiberation);
  const stateKey = await getStateAddress()

  const paramFormatted = await formartParams2Project(  
    prepareDate,
    whiltelistStartDate,
    whiltelistEndDate,
    saleStartDate,
    saleEndDate,
    distributionDate,
    
    tokenPrice,
    extraRate,
    maxAllocationPerUser,
    totalAllocation,
    firstLiberation,
  );

  const projectKey = await getProjectAddress(projectMint)
  let tx = null;
  try{
    console.log("Updating project");
    await program.account.projectAccount.fetch(projectKey);
    tx = await program.transaction.updateProject(
      ...paramFormatted,
      {
        accounts: {
          state: stateKey,
          project: projectKey,
          mainSaleMint: priceTokenMint,
          extraSaleMint: extraTokenMint,
          authority: wallet.publicKey,
          ...defaultAccounts,
        }
    })
  }catch {
    console.log("Creating project");
    const projectVaultKey = await getProjectVaultAddress(projectMint)

    tx = await program.transaction.createProject(
      ...paramFormatted,
      {
        accounts: {
          state: stateKey,
          project: projectKey,
          projectMint,
          projectVault: projectVaultKey,
          mainSaleMint: priceTokenMint,
          extraSaleMint: extraTokenMint,
          authority: wallet.publicKey,
          ...defaultAccounts,
        }
    })
  }
  const txHash = await sendTransaction(connection, wallet, tx);
  console.log("txHash =", txHash);
  return txHash;
}

export async function depositProjectToken(
  connection:Connection,
  wallet: any,
  projectMint: PublicKey,
  userVault: PublicKey,
  amount:any
) {
  const projectKey = await getProjectAddress(projectMint)
  const projectVaultKey = await getProjectVaultAddress(projectMint)
  const tx = await program.transaction.depositProjectToken(
    new BN(amount),
    {
      accounts:{
        project: projectKey,
        projectVault: projectVaultKey,
        userVault: userVault,
        authority: wallet.publicKey,
        ...defaultAccounts
      }
    });
    const txHash = await sendTransaction(connection, wallet, tx);
    console.log("txHash =", txHash);
    return txHash;
}

export async function withdrawProjectToken(
  connection:Connection,
  wallet: any,
  projectMint: PublicKey,
  userVault: PublicKey,
  amount:any
) {
  const projectKey = await getProjectAddress(projectMint)
  const projectVaultKey = await getProjectVaultAddress(projectMint)
  const tx = await program.transaction.withdrawProjectToken(
    new BN(amount),
    {
      accounts:{
        project: projectKey,
        projectVault: projectVaultKey,
        userVault: userVault,
        authority: wallet.publicKey,
        ...defaultAccounts
      }
    });
    const txHash = await sendTransaction(connection, wallet, tx);
    console.log("txHash =", txHash);
    return txHash;

}
export async function subscribeToWhitelist(
  connection:Connection,
  wallet: any,
  projectMint: string | PublicKey,
) {
  const stateKey = await getStateAddress()
  const projectKey = await getProjectAddress(projectMint)
  const userKey = await getUserAddress(projectKey, wallet.publicKey);
  const tx = await program.transaction.registerUser(
    {
      accounts: {
        state: stateKey,
        project: projectKey,
        user: userKey,
        authority: wallet.publicKey,
        ...defaultAccounts,
      },
  })
  const txHash = await sendTransaction(connection, wallet, tx);
  console.log("txHash =", txHash);
  return txHash;
}

export const isSubscribed = async (
  wallet: any,
  projectMint: PublicKey,
) => {
  const projectKey = await getProjectAddress(projectMint);
  const userKey = await getUserAddress(projectKey, wallet.publicKey);
  let userData = null;
  try {
    userData = await program.account.userAccount.fetch(userKey);
  } catch {}
  
  return userData !== null;
}


export async function buyTokens(
  connection:Connection,
  wallet: any,
  projectMint: any,
  userMainSaleTokenAccount: any,
  userExtraSaleTokenAccount: any,
  amount:any,
  hashStr: any = "",
) {
  const payableAmount = new anchor.BN(amount)
  const stateKey = await getStateAddress()
  const projectKey = await getProjectAddress(projectMint)

  const state = await getState();
  const project = await getProject(projectMint);
  const getHashArr = (hashStr: string) => {
    console.log(hashStr);
    if (hashStr.length !== 64) return;
    let arrHash = [];
    for (let i = 0; i < hashStr.length; i += 2) {
      arrHash.push(parseInt('0x' + hashStr.slice(i, i + 2)));
      console.log(hashStr.slice(i, i + 2));
    }
    return arrHash;
  }




  console.log('hashStr=', hashStr);

  const hashValue = getHashArr(hashStr);

  console.log('hashValue=', hashValue);

  const userKey = await getUserAddress(projectKey, wallet.publicKey);

  const treasuryPriceTokenAccount = await findAssociatedTokenAddress(state?.treasury as PublicKey, project?.mainSaleMint as PublicKey)
  const treasuryCRPTokenAccount = await findAssociatedTokenAddress(state?.treasury as PublicKey, project?.extraSaleMint as PublicKey)

  const tx = new Transaction();
  const signers: Account[] = []
  let wrappedCoinSolAccount

  if(! await isSubscribed(wallet, projectMint)){

    tx.add(
      await program.instruction.registerUser(
        {
          accounts: {
            state: stateKey,
            project: projectKey,
            user: userKey,
            authority: wallet.publicKey,
            ...defaultAccounts,
          },
      })
    );

  }





  if(project?.mainSaleMint == TOKENS.WSOL.mintAddress){
    wrappedCoinSolAccount = await createTokenAccountIfNotExist(
        connection,
        wrappedCoinSolAccount,
        wallet.publicKey,
        TOKENS.WSOL.mintAddress,
        amount + 1e7,
        tx,
        signers
    )
    tx.add(
      createSyncNativeInstruction(TOKEN_PROGRAM_ID, wrappedCoinSolAccount)
    );

    userMainSaleTokenAccount = wrappedCoinSolAccount;
  }


  tx.add(
    await program.instruction.pay(
      payableAmount,
      hashValue,
      {
        accounts: {
          state: stateKey,
          project: projectKey,
          user: userKey,
          treasuryMainVault: treasuryPriceTokenAccount,
          treasuryExtraVault: treasuryCRPTokenAccount,
          userMainVault: userMainSaleTokenAccount,
          userExtraVault: project?.extraRate.toString() !== '0' ? userExtraSaleTokenAccount : userMainSaleTokenAccount,
          mainSaleMint: project?.mainSaleMint as PublicKey,
          extraSaleMint: project?.extraSaleMint as PublicKey,
          authority: wallet.publicKey,

          nftStakingState: await getNftStakingStateKey(wallet.publicKey),
          
          treasury: state?.treasury as PublicKey,
          ...defaultAccounts,
        },
    })
  );
  if (wrappedCoinSolAccount) {
    tx.add(
      closeAccount({
        source: wrappedCoinSolAccount,
        destination: wallet.publicKey,
        owner: wallet.publicKey
      })
    )
  }
  console.log("tx =", tx);
  const txHash = await sendTransaction(connection, wallet, tx);
  console.log("txHash =", txHash);
  return txHash;
}

export async function claimTokens(
  connection:Connection,
  wallet: any,
  projectMint: any
) {
  const projectKey = await getProjectAddress(projectMint)
  const projectVaultKey = await getProjectVaultAddress(projectMint);

  const userKey = await getUserAddress(projectKey, wallet.publicKey);
  const userProjectTokenAccount = await findAssociatedTokenAddress(wallet.publicKey, new PublicKey(projectMint));
  const tx = await program.transaction.claimProjectToken(
    {
      accounts: {
        project: projectKey,
        user: userKey,
        projectVault: projectVaultKey,
        userProjectToken: userProjectTokenAccount,
        projectMint,
        authority: wallet.publicKey,
        ...defaultAccounts,
      },
  });
  const txHash = await sendTransaction(connection, wallet, tx);
  console.log("txHash =", txHash);
  return txHash;
}

export async function getMintDecimals (mint : string| PublicKey) {
  const info = await serumCmn.getMintInfo(program.provider, new PublicKey(mint))
  return info.decimals
}