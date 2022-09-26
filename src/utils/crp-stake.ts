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
}

import waggle_farm_idl from '@/utils/cropper_staking.json'
import { Account, Connection } from '@solana/web3.js';
import { createSplAccount } from './crp-swap';
import { getUpdateUserTierIx, getUserTier, isSubscribed, getUserDatas, setAnchorProvider as LaunchpadProgramProvider } from './crp-launchpad';
import { createAssociatedTokenAccountIfNotExist2, sendTransaction } from './web3';
import { STAKE_TIERS_PROGRAM_ID, DEVNET_MODE } from './ids';
import moment from 'moment';
let StakingProgram:any = null

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
  const program = new (anchor as any).Program(waggle_farm_idl, new PublicKey(STAKE_TIERS_PROGRAM_ID), provider);
  StakingProgram = program

}

export interface ExtraRewardConfigs{
  duration: any
  extraPercentage: any
}

export async function getFarmStateAddress(){
  const [stateSigner, stateBump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('state')],
    StakingProgram.programId
  );
  return stateSigner
}

async function getExtraRewardAddress(){
  const [stateSigner, stateBump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('extra')],
    StakingProgram.programId
  );
  return stateSigner
}

async function getPoolAddressFromMint(mint:string){
  const [stateSigner, stateBump] = await anchor.web3.PublicKey.findProgramAddress(
    [new PublicKey(mint).toBuffer()],
    StakingProgram.programId
  );
  return stateSigner
}
const ACC_PRECISION = new BN(100 * 1000 * 1000 * 1000);
const FULL_100 = new BN (100 * 1000 * 1000 * 1000);
export function estimateRewards(
  stateData:any,
  extraConfigData:any,
  poolData:any,
  userData:any,
){
  const currentTimeStamp = Math.ceil(new Date().getTime() / 1000);

  const duration = new BN(Math.max(currentTimeStamp - poolData.lastRewardTime, 0))

  const reward_per_share = stateData.tokenPerSecond.mul(duration).mul(ACC_PRECISION).div(poolData.amount);
  const acc_reward_per_share = poolData.accRewardPerShare.add(reward_per_share);

  let extraPercentage = new BN(0)
  extraConfigData.configs.forEach((item:any)=>{
    if(item.duration.toString() === userData.lockDuration.toString())
    {
      extraPercentage = item.extraPercentage
      return;
    }
  })

  const pending_amount = userData.amount.mul( acc_reward_per_share).div(ACC_PRECISION).sub(userData.rewardDebt);
  const extra_amount = userData.extraReward.add(pending_amount.mul(extraPercentage).div(FULL_100));
  const total_reward = userData.rewardAmount.add(pending_amount).add(extra_amount)

  return total_reward.toString()
}


export function estimateRewardsPerSec(
  stateData:any,
  extraConfigData:any,
  poolData:any,
  userData:any,
){
  const currentTimeStamp = Math.ceil(new Date().getTime() / 1000);

  const duration = new BN(Math.max(currentTimeStamp - poolData.lastRewardTime, 0))

  const reward_per_share = stateData.tokenPerSecond.mul(duration).mul(ACC_PRECISION).div(poolData.amount);
  const acc_reward_per_share = poolData.accRewardPerShare.add(reward_per_share);

  let extraPercentage = new BN(0)
  extraConfigData.configs.forEach((item:any)=>{
    if(item.duration.toString() === userData.lockDuration.toString())
    {
      extraPercentage = item.extraPercentage
      return;
    }
  })

  const pending_amount = userData.amount.mul( acc_reward_per_share).div(ACC_PRECISION).sub(userData.rewardDebt);
  const extra_amount = userData.extraReward.add(pending_amount.mul(extraPercentage).div(FULL_100));
  const total_reward = userData.rewardAmount.add(pending_amount).add(extra_amount)
  return ((total_reward / 1000000000) / ((currentTimeStamp - poolData.lastRewardTime.toString()) * 1000));
}

export async function createFarmState(
  connection:Connection,
  wallet: any,
  tokenPerSecond: number,
  rewardMint: string,
)
{
  const transaction = new Transaction()
  const signers: Account[] = []

  const [stateSigner, stateBump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('state')],
    StakingProgram.programId
  );

  const stateRewardVault = await createAssociatedTokenAccountIfNotExist2(
    null,
    stateSigner,
    wallet.publicKey,
    rewardMint,
    transaction
  )

  transaction.add(
    StakingProgram.instruction.createState(stateBump, new BN(tokenPerSecond), {
      accounts: {
        state: stateSigner,
        rewardMint: rewardMint,
        rewardVault: stateRewardVault,
        authority: wallet.publicKey,
        ...defaultAccounts
      }
    })
  )

  // const stateInfo = await StakingProgram.account.stateAccount.fetch(stateSigner)
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function getFarmState(){
  const stateSigner = await getFarmStateAddress();
  return await StakingProgram.account.stateAccount.fetch(stateSigner)
}

export async function getExtraRewardConfigs(){
  const [extraRewardSigner, extraRewardBump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('extra')],
    StakingProgram.programId
  );
  const extraRewardConfigs = await StakingProgram.account.extraRewardsAccount.fetch(extraRewardSigner)
  // assert.ok(extraRewardConfigs.configs.length === 3)
  // assert.ok(new BN(1).eq(extraRewardConfigs.configs[1].duration))
  // assert.ok(getNumber(50).eq(extraRewardConfigs.configs[1].extraPercentage))
  return extraRewardConfigs
}


export async function createExtraReward(
  connection:Connection,
  wallet: any,
){
  const transaction = new Transaction()
  const signers: Account[] = []

  const [extraRewardSigner, extraRewardBump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('extra')],
    StakingProgram.programId
  );
  console.log(extraRewardSigner.toString(), extraRewardBump)

  const tx = await StakingProgram.instruction.createExtraRewardConfigs(extraRewardBump,
    [{ duration: new BN(0), extraPercentage: new BN(0) }],
    {
      accounts: {
        extraRewardAccount: extraRewardSigner,
        authority: wallet.publicKey,
        ...defaultAccounts
      },
    })
  transaction.add(tx)
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function setExtraReward(
  connection:Connection,
  wallet: any,
  extraRewards: ExtraRewardConfigs[],
)
{

  const transaction = new Transaction()
  const signers: Account[] = []

  const [extraRewardSigner, extraRewardBump] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode('extra')],
    StakingProgram.programId
  );

  transaction.add(StakingProgram.instruction.setExtraRewardConfigs(extraRewards, {
    accounts: {
      extraRewardAccount: extraRewardSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    },
  }))
  return await sendTransaction(connection, wallet, transaction, signers)

}


export async  function  fundToProgram(
  connection:Connection,
  wallet: any,
  poolSigner: string,
  masterRewardVault:string,
  amount:any
) {

  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getFarmStateAddress()
  const state = await getFarmState()
  // await rewardMint.mintTo(stateRewardVault, wallet, [provider.wallet], getNumber(10000).toString())
  const tx = StakingProgram.instruction.fundRewardToken(new BN(amount), {
    accounts: {
      pool: poolSigner,
      state: stateSigner,
      rewardVault: state.rewardVault,
      userVault: masterRewardVault,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })
  transaction.add(tx)
  return await sendTransaction(connection, wallet, transaction, signers)

}


export async function getAllPools(){
  const pools = await StakingProgram.account.farmPoolAccount.all()
  return pools
}

export async function createPool(
  connection:Connection,
  wallet: any,
  rewardMint: string,
  pools: any[]
) {

  const transaction = new Transaction()
  const signers: Account[] = []
  

  const [poolSigner, poolBump] = await anchor.web3.PublicKey.findProgramAddress(
    [new PublicKey(rewardMint).toBuffer()],
    StakingProgram.programId
  );
  const stateSigner = await getFarmStateAddress()

  const poolVault = await createAssociatedTokenAccountIfNotExist2(
    null, 
    poolSigner, 
    wallet.publicKey,  
    rewardMint, 
    transaction)


  // let pools = await StakingProgram.account.farmPoolAccount.all()
  transaction.add(
    StakingProgram.instruction.createPool(poolBump, new BN('0'), new BN('0'), {
      accounts: {
        pool: poolSigner,
        state: stateSigner,
        mint: rewardMint,
        vault: poolVault,
        authority: wallet.publicKey,
        ...defaultAccounts
      },
      remainingAccounts: pools.map(p => ({
        pubkey: p.publicKey,
        isWritable: true,
        isSigner: false
      }))
    })
  )
  // let stateInfo = await program.account.stateAccount.fetch(stateSigner)
  // let poolInfo = await program.account.farmPoolAccount.fetch(poolSigner)
  // assert.ok(poolInfo.point.eq(stateInfo.totalPoint))
  // assert.ok(poolInfo.point.eq(new BN('0')))
  // assert.ok(poolInfo.amountMultipler.eq(new BN(0)))
  return await sendTransaction(connection, wallet, transaction, signers)
}
export async function closePool(
  connection:Connection,
  wallet: any,
  poolSigner:string,
  pools:any[]
){
  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getFarmStateAddress()
  
  StakingProgram.instruction.closePool({
    accounts: {
      pool: new PublicKey(poolSigner),
      state: stateSigner,
      authority: wallet,
      ...defaultAccounts
    },
    remainingAccounts: pools.map(p => ({
      pubkey: p.publicKey,
      isWritable: true,
      isSigner: false
    }))
  })
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function changePoolAmountMultipler(
  connection:Connection,
  wallet: any,
  poolSigner:string,
) {
  
  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getFarmStateAddress()

  const tx = StakingProgram.instruction.changePoolAmountMultipler(new BN(1), {
    accounts: {
      pool: new PublicKey(poolSigner),
      state: stateSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  })

  transaction.add(tx);

  return await sendTransaction(connection, wallet, transaction, signers)
}
export async function changeTokenPerSecond(
  connection:Connection,
  wallet: any,
  pools:any[]
){
  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getFarmStateAddress()
  const tx = StakingProgram.instruction.changeTokensPerSecond(new BN(40), {
    accounts: {
      state: stateSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    },
    remainingAccounts: pools.map(p => ({
      pubkey: p.publicKey,
      isWritable: true,
      isSigner: false
    }))
  })

  transaction.add(tx);
  return await sendTransaction(connection, wallet, transaction, signers)
}
export async function changePoolPoint(
  connection:Connection,
  wallet: any,
  poolSigner: string,
) {

  const transaction = new Transaction()
  const signers: Account[] = []
  
  const stateSigner = await getFarmStateAddress()

  let pools = await getAllPools()
  
  const ix = StakingProgram.instruction.changePoolPoint(new BN(1000), {
    accounts: {
      pool: new PublicKey(poolSigner),
      state: stateSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    },
    remainingAccounts: pools.map((p : any) => ({
      pubkey: p.publicKey,
      isWritable: true,
      isSigner: false
    }))
  })
  transaction.add(ix);
  return await sendTransaction(connection, wallet, transaction, signers)
}

export async function getPoolUserAccount(
  wallet: any,
  poolSigner: any,
){
  
  const [poolUserAccount, bump1] = await PublicKey.findProgramAddress([
    poolSigner.toBuffer(), wallet.publicKey.toBuffer()
  ], StakingProgram.programId)

  return await StakingProgram.account.farmPoolUserAccount.fetch(poolUserAccount)
}

const ONE_YEAR_SECOND = 365 * 24 * 3600;
export const TIERS_XCRP = [0, 200, 2000, 10000, 20000, 100000, 100000000000 , 10000000000000] // ???????tofix
export function calculateTiers(amount: number, lockDuration: number, wallet: any)
{

  let rate = 0;

  switch(lockDuration / 60){
    case 43200:
      rate = 1/12;
    break;
    case 129600:
      rate = 0.25;
    break;
    case 259200:
      rate = 0.5;
    break;
    case 525600:
      rate = 1;
    break;
  }


  let multiplicator = 1

  if(wallet && wallet.nftStakingState && wallet.nftStakingState.potionCounts){
    for(let i = 0; i < 4 ; i++){
      switch(i){
        case 0:
          multiplicator += (.1 * wallet.nftStakingState.potionCounts[i])
        break;
        case 1:
          multiplicator += (.25 * wallet.nftStakingState.potionCounts[i])
        break;
        case 2:
          multiplicator += (.5 * wallet.nftStakingState.potionCounts[i])
        break;
        case 3:
          multiplicator += (1 * wallet.nftStakingState.potionCounts[i])
        break;
      }
    }
  }

  if(DEVNET_MODE){
    rate = 1;
  }

  const xCRPbeforeNFT = rate * amount
  const xCRP = rate * amount * multiplicator;


  let i = 0;
  for(; i < TIERS_XCRP.length; i ++)
  {
    if (TIERS_XCRP[i] > xCRP) {
      break;
    }
  }
  i --;

  let percentBlue = 0;
  let percentPurple = 0;

  if(Number(xCRPbeforeNFT.toFixed(2)) < TIERS_XCRP[i]){
    percentBlue = 0;
    percentPurple = (Number(xCRP.toFixed(2)) - TIERS_XCRP[i]) * 100 / (TIERS_XCRP[i + 1] - TIERS_XCRP[i]);
  } else {
    percentBlue = ((Number(xCRPbeforeNFT.toFixed(2)) - TIERS_XCRP[i]) / (TIERS_XCRP[i + 1] - TIERS_XCRP[i])) * 100;
    percentPurple = ((Number(xCRP.toFixed(2)) - TIERS_XCRP[i]) / (TIERS_XCRP[i + 1] - TIERS_XCRP[i])) * 100;
  }


  console.log('Multiplicator:' ,multiplicator);

  return {
    xCRP: Number(xCRP.toFixed(2)), 
    xCRPbeforeNFT: Number(xCRPbeforeNFT.toFixed(2)), 
    percentBlue: percentBlue, 
    percentPurple: percentPurple, 
    boostTotal : (multiplicator - 1) * 100,
    tiers: i,
  };
}

export async function stake (
  connection:Connection,
  wallet: any,

  poolSigner:string,

  rewardMint: string,
  poolVault: string,

  rewardUserVault: string,

  amount:any, 
  lock = 0
) {

  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getFarmStateAddress()
  const extraRewardSigner = await getExtraRewardAddress()
  // const poolSigner = await getPoolAddressFromMint(rewardMint)

  const [userAccount, bump1] = await PublicKey.findProgramAddress([
    new PublicKey(poolSigner).toBuffer(), wallet.publicKey.toBuffer()
  ], StakingProgram.programId)
  try{
    await StakingProgram.account.farmPoolUserAccount.fetch(userAccount)
  }
  catch
  {
    console.log("You are the new user to stake")
    transaction.add( StakingProgram.instruction.createUser(bump1, {
      accounts: {
        user: userAccount,
        state: stateSigner,
        pool: poolSigner,
        authority: wallet.publicKey,
        ...defaultAccounts
      }
    }));
  }

  transaction.add(StakingProgram.instruction.stake(new BN(amount), new BN(lock), {
    accounts: {
      mint: rewardMint,
      extraRewardAccount: extraRewardSigner,
      poolVault: poolVault,
      userVault: rewardUserVault,
      user: userAccount,
      state: stateSigner,
      pool: poolSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }));

    let someMint = '' ;

    if(!([
    'AFZkhKGF9GqEuNb8FEmE3Jb3Ui7fWgyccTT3yJoxWuQL',
    'HiSzoQfEKXnJN5nA1Z7MUd8AbW4akMqpERXBdhwjNme4',
    'EFCPaZ8eAXD4tnTFuamFcuv9mt3PS3tYAbeAb4vk8pp4',
    'Dz2vU5QJSVow9WMkFhUTPZpfz5J8vcDuv81MW4Z6E4Jy',
    '5Tpi3fWL6XwKqNAV8Th3HK5g6bW3ceKaJ5pqz8GtyL85',
    '3a13fbzAGsV1rNhg5Uas2XoDWMKFYGiuwW3vjFdJYoZW',
    '9ke9BcXtKYc8FsAyjy3cpQDkUT4ePdqnJdupCkPx6Xm5',
    'A7xwL74dgB6bYVco7BfhtCEpi9gphz6rj2EVS77Dd6Lt',
    'AU78FcWzwGrNg7hycPLdB2JWwEHY8xTfyS3UoWdyuChn',
    '8ifzzBQtem2wE1JH3YUVX1Uco2H5XvQuF7mqfnKeRXeJ',
    '6b13W29VDDS7R2ikyUeUeZaWkGftfoZgA3Nd22fAkkb8',
    'FwgwVdYf4hoUgc482bNBNXcNVto9LJoLB8qC7xgk8JSq'
       ]).includes(wallet.publicKey.toString())){

      const responseData = await fetch(
        'https://api.cropper.finance/fertilizer/'
      ).then((res) => res.json())

      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let hours = ("0" + date_ob.getHours()).slice(-2);
      let minutes = ("0" + date_ob.getMinutes()).slice(-2);
      let seconds = ("0" + date_ob.getSeconds()).slice(-2);


      const curdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds; 

      LaunchpadProgramProvider(connection, wallet)

      for (const element of responseData.message) {
        if(
          curdate > element.date_whitelist_start && 
          curdate < element.date_whitelist_end && 
          await isSubscribed(wallet, new PublicKey(element.mint))
        ){
          someMint = element.mint;
          transaction.add(await getUpdateUserTierIx(wallet, new PublicKey(element.mint)));
        }
      }
    }

  let txHash = await sendTransaction(connection, wallet, transaction, signers);

  if(!([
    'AFZkhKGF9GqEuNb8FEmE3Jb3Ui7fWgyccTT3yJoxWuQL',
    'HiSzoQfEKXnJN5nA1Z7MUd8AbW4akMqpERXBdhwjNme4',
    'EFCPaZ8eAXD4tnTFuamFcuv9mt3PS3tYAbeAb4vk8pp4',
    'Dz2vU5QJSVow9WMkFhUTPZpfz5J8vcDuv81MW4Z6E4Jy',
    '5Tpi3fWL6XwKqNAV8Th3HK5g6bW3ceKaJ5pqz8GtyL85',
    '3a13fbzAGsV1rNhg5Uas2XoDWMKFYGiuwW3vjFdJYoZW',
    '9ke9BcXtKYc8FsAyjy3cpQDkUT4ePdqnJdupCkPx6Xm5',
    'A7xwL74dgB6bYVco7BfhtCEpi9gphz6rj2EVS77Dd6Lt',
    'AU78FcWzwGrNg7hycPLdB2JWwEHY8xTfyS3UoWdyuChn',
    '8ifzzBQtem2wE1JH3YUVX1Uco2H5XvQuF7mqfnKeRXeJ',
    '6b13W29VDDS7R2ikyUeUeZaWkGftfoZgA3Nd22fAkkb8',
    'FwgwVdYf4hoUgc482bNBNXcNVto9LJoLB8qC7xgk8JSq'
       ]).includes(wallet.publicKey.toString()) && someMint != ''){

    let registeredSCDatas = await getUserDatas(wallet, new PublicKey(someMint))

    let requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spl: wallet.publicKey.toString(),
        hash: registeredSCDatas.hashStr
      })
    }
    await fetch('https://flow.cropper.finance/registers/', requestOptions)
  }

  return txHash;
}

export async function unstake (
  connection:Connection,
  wallet: any,
  
  poolSigner:string,
  rewardMint: string,
  poolVault: string,
  rewardUserVault:string,
  amount: number
) {

  const transaction = new Transaction()
  const signers: Account[] = []
  
  const stateSigner = await getFarmStateAddress()
  const programState = await getFarmState()
  
  const extraRewardSigner = await getExtraRewardAddress()
  // const poolSigner = await getPoolAddressFromMint(rewardMint)

  const [poolUserAccount, bump1] = await PublicKey.findProgramAddress([
    new PublicKey(poolSigner).toBuffer(), wallet.publicKey.toBuffer()
  ], StakingProgram.programId)


  transaction.add(StakingProgram.instruction.unstake(new BN(amount), {
    accounts: {
      mint: rewardMint,
      extraRewardAccount: extraRewardSigner,
      poolVault: poolVault,
      userVault: rewardUserVault,
      user: poolUserAccount,
      state: stateSigner,
      pool: poolSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }))
  
  transaction.add(StakingProgram.instruction.harvest({
    accounts: {
      mint: rewardMint,
      extraRewardAccount: extraRewardSigner,
      rewardVault: programState.rewardVault,
      userVault: rewardUserVault,
      user: poolUserAccount,
      state: stateSigner,
      pool: poolSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  }))
  
    let someMint = '';

    if(!([
    'AFZkhKGF9GqEuNb8FEmE3Jb3Ui7fWgyccTT3yJoxWuQL',
    'HiSzoQfEKXnJN5nA1Z7MUd8AbW4akMqpERXBdhwjNme4',
    'EFCPaZ8eAXD4tnTFuamFcuv9mt3PS3tYAbeAb4vk8pp4',
    'Dz2vU5QJSVow9WMkFhUTPZpfz5J8vcDuv81MW4Z6E4Jy',
    '5Tpi3fWL6XwKqNAV8Th3HK5g6bW3ceKaJ5pqz8GtyL85',
    '3a13fbzAGsV1rNhg5Uas2XoDWMKFYGiuwW3vjFdJYoZW',
    '9ke9BcXtKYc8FsAyjy3cpQDkUT4ePdqnJdupCkPx6Xm5',
    'A7xwL74dgB6bYVco7BfhtCEpi9gphz6rj2EVS77Dd6Lt',
    'AU78FcWzwGrNg7hycPLdB2JWwEHY8xTfyS3UoWdyuChn',
    '8ifzzBQtem2wE1JH3YUVX1Uco2H5XvQuF7mqfnKeRXeJ',
    '6b13W29VDDS7R2ikyUeUeZaWkGftfoZgA3Nd22fAkkb8',
    'FwgwVdYf4hoUgc482bNBNXcNVto9LJoLB8qC7xgk8JSq'
       ]).includes(wallet.publicKey.toString())){
    
      const responseData = await fetch(
        'https://api.cropper.finance/fertilizer/'
      ).then((res) => res.json())

      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let hours = ("0" + date_ob.getHours()).slice(-2);
      let minutes = ("0" + date_ob.getMinutes()).slice(-2);
      let seconds = ("0" + date_ob.getSeconds()).slice(-2);


      const curdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds; 

      LaunchpadProgramProvider(connection, wallet)
      
      for (const element of responseData.message) {
        if(
          curdate > element.date_whitelist_start && 
          curdate < element.date_whitelist_end && 
          await isSubscribed(wallet, new PublicKey(element.mint))
        ){
          someMint = element.mint;
          transaction.add(await getUpdateUserTierIx(wallet, new PublicKey(element.mint)));
        }
      }
    }



  let txHash = await sendTransaction(connection, wallet, transaction, signers);




  if(!([
    'AFZkhKGF9GqEuNb8FEmE3Jb3Ui7fWgyccTT3yJoxWuQL',
    'HiSzoQfEKXnJN5nA1Z7MUd8AbW4akMqpERXBdhwjNme4',
    'EFCPaZ8eAXD4tnTFuamFcuv9mt3PS3tYAbeAb4vk8pp4',
    'Dz2vU5QJSVow9WMkFhUTPZpfz5J8vcDuv81MW4Z6E4Jy',
    '5Tpi3fWL6XwKqNAV8Th3HK5g6bW3ceKaJ5pqz8GtyL85',
    '3a13fbzAGsV1rNhg5Uas2XoDWMKFYGiuwW3vjFdJYoZW',
    '9ke9BcXtKYc8FsAyjy3cpQDkUT4ePdqnJdupCkPx6Xm5',
    'A7xwL74dgB6bYVco7BfhtCEpi9gphz6rj2EVS77Dd6Lt',
    'AU78FcWzwGrNg7hycPLdB2JWwEHY8xTfyS3UoWdyuChn',
    '8ifzzBQtem2wE1JH3YUVX1Uco2H5XvQuF7mqfnKeRXeJ',
    '6b13W29VDDS7R2ikyUeUeZaWkGftfoZgA3Nd22fAkkb8',
    'FwgwVdYf4hoUgc482bNBNXcNVto9LJoLB8qC7xgk8JSq'
       ]).includes(wallet.publicKey.toString()) && someMint != ''){

    let registeredSCDatas = await getUserDatas(wallet, new PublicKey(someMint))

    let requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spl: wallet.publicKey.toString(),
        hash: registeredSCDatas.hashStr
      })
    }
    await fetch('https://flow.cropper.finance/registers/', requestOptions)
  }


  return txHash;

}

export async function harvest (
  connection:Connection,
  wallet: any,
  poolSigner: string,
  rewardMint: string,
  rewardUserVault: string,
  stateRewardVault: string
) {

  const transaction = new Transaction()
  const signers: Account[] = []

  const stateSigner = await getFarmStateAddress()
  const extraRewardSigner = await getExtraRewardAddress()
  // const poolSigner = await getPoolAddressFromMint(rewardMint)

  const [poolUserAccount, bump1] = await PublicKey.findProgramAddress([
    new PublicKey(poolSigner).toBuffer(), wallet.publicKey.toBuffer()
  ], StakingProgram.programId)



  const tx = StakingProgram.instruction.harvest({
    accounts: {
      mint: rewardMint,
      extraRewardAccount: extraRewardSigner,
      rewardVault: stateRewardVault,
      userVault: rewardUserVault,
      user: poolUserAccount,
      state: stateSigner,
      pool: poolSigner,
      authority: wallet.publicKey,
      ...defaultAccounts
    }
  });
  
  transaction.add(tx);
  
  return await sendTransaction(connection, wallet, transaction, signers)
}
