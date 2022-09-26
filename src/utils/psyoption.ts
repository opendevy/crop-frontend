import { BN, web3 } from "@project-serum/anchor";
import { 
  MintLayout 
} from "@solana/spl-token";
import { Token } from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { OptionMarket, createProgram, instructions, OptionMarketWithKey } from "@mithraic-labs/psy-american";
import { Tokens } from "@mithraic-labs/psy-token-registry";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, RENT_PROGRAM_ID, SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@/utils/ids'
import { createSyncNativeInstruction, createTokenAccountIfNotExist, findAssociatedTokenAddress, sendTransaction } from './web3';

const dtf = Intl.DateTimeFormat(undefined, { timeZoneName: "short" });




export const listAllOptions = async (connection: any, wallet: any) => {


  
}


export const optionMarketFamily = {
  key: "optionMarketFamily",
  default: null
};

export const psyAmericanOptionKeys = {
  key: "optionMarketKeys",
  default: []
};


export function setAnchorProvider(
  connection: any,
  wallet: any
){

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions(),
  );

  //@ts-ignore
  return createProgram(new web3.PublicKey("R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs"), provider);
  
}



export const mapNetworkTypes = (key: any): any => {
  switch (key) {
    case WalletAdapterNetwork.Mainnet:
      return "mainnet";
    case WalletAdapterNetwork.Devnet:
      return "devnet";
    default:
      return "mainnet";
  }
};
/**
 *
 * A human readable number for the amount of tokens that will be received if all contracts are
 * exercised.
 *
 * @param optionMeta
 * @param tokenAccount
 * @param network
 * @returns
 */
export const tokensToReceive = async(
  optionMeta: OptionMarket,
  tokenAccount: any,
  network: any = "mainnet"
) => {
  const u64Amount = optionMeta.underlyingAmountPerContract.muln(
    Number(tokenAccount.amount)
  );
  // Factor in the underlying decimals
  //@ts-ignore
  let tokens = await fetch('https://api.cropper.finance/options/').then((res) =>
              res.json());

  tokens = tokens.token_infos

  //@ts-ignore
  const underlyingToken = tokens[optionMarket.underlyingAssetMint.toString()]

  const amount = u64Amount.toNumber() / Math.pow(10, underlyingToken.decimals);
  return { amount, symbol: underlyingToken.symbol };
};

/**
 *
 * A human readable number for the amount it will require to exercise the contracts
 * @param optionMeta
 * @param tokenAccount
 * @param network
 * @returns
 */
export const costToExercise = async(
  optionMeta: OptionMarket,
  tokenAccount: any,
  network: any = "mainnet"
) => {
  const u64Amount = optionMeta.quoteAmountPerContract.muln(
    Number(tokenAccount.amount)
  );
  // Factor in the quote decimals
  //@ts-ignore
  let tokens = await fetch('https://api.cropper.finance/options/').then((res) =>
              res.json());

  tokens = tokens.token_infos

  //@ts-ignore
  const quoteToken = tokens[optionMeta.quoteAssetMint.toString()];
  const amount = u64Amount.toNumber() / Math.pow(10, quoteToken.decimals);
  return { amount, symbol: quoteToken.symbol };
};

export const loadMintInfo = async (
  connection: Connection,
  projectOptions: any[]
): Promise<Record<string, any>> => {
  // Extract all the unique mints from the projects and options
  const mintAddresses: Record<string, PublicKey> = {};
  projectOptions.forEach(({ project, options }) => {
    if (!mintAddresses[project.mintAddress]) {
      mintAddresses[project.mintAddress] = new PublicKey(project.mintAddress);
    }

    //@ts-ignore
    options.forEach(({ optionMarket }) => {
      if (!mintAddresses[optionMarket.underlyingAssetMint.toString()]) {
        mintAddresses[optionMarket.underlyingAssetMint.toString()] =
          optionMarket.underlyingAssetMint;
      }
      if (!mintAddresses[optionMarket.quoteAssetMint.toString()]) {
        mintAddresses[optionMarket.quoteAssetMint.toString()] =
          optionMarket.quoteAssetMint;
      }
    });
  });

  const mintInfos: Record<string, any> = {};
  const mintAddressArr = Object.keys(mintAddresses);
  const resp = await connection.getMultipleAccountsInfo(
    Object.values(mintAddresses)
  );
  resp.forEach((info, index) => {
    if (!info) return;
    const mintInfo = MintLayout.decode(info.data);
    const val = {
      address: new PublicKey(mintAddressArr[index]),
      mintAuthority: mintInfo.mintAuthority ? mintInfo.mintAuthority : null,
      supply: mintInfo.supply,
      decimals: mintInfo.decimals,
      isInitialized: mintInfo.isInitialized,
      freezeAuthority: mintInfo.freezeAuthority,
    };
    return val;
  });

  return mintInfos;
};

export const bnToFloat = (
  amount: BN,
  decimals: number,
  decimalsToKeep: number = 2
) => {
  if (decimalsToKeep > decimals) {
    throw new Error("decimalsToKeep cannot be greater than decimals");
  }
  return (
    amount.div(new BN(10).pow(new BN(decimals - decimalsToKeep))).toNumber() /
    Math.pow(10, decimalsToKeep)
  );
};

export const displayExpirationDate = (optionMarket: OptionMarket) => {
  const d = new Date(optionMarket.expirationUnixTimestamp.toNumber() * 1_000);
  const timezoneAbbrev = dtf
    .formatToParts(d)
    .find((part) => part.type == "timeZoneName")?.value;
  return `${d.toLocaleDateString()} ${d
    .toLocaleTimeString()
    .substring(0, 5)} ${timezoneAbbrev}`;
};

export async function displayStrikePrice(
  optionMarket: OptionMarket,
  network: any
): Promise<string> {
  //@ts-ignore
  let tokens = await fetch('https://api.cropper.finance/options/').then((res) =>
              res.json());

  tokens = tokens.token_infos

  //@ts-ignore
  const quoteToken = tokens[optionMarket.quoteAssetMint.toString()];

  if(!quoteToken.decimals){
    quoteToken.decimals = 9;
  }

  //@ts-ignore
  const underlyingToken = tokens[optionMarket.underlyingAssetMint.toString()]

  const strike = calculateStrike(
    optionMarket.underlyingAmountPerContract,
    optionMarket.quoteAmountPerContract,
    quoteToken.decimals,
    underlyingToken.decimals
  );
  return strike.toFixed(2)
}

export function calculateStrike(
  underlyingAmount: BN,
  quoteAmount: BN,
  quoteDecimals: number,
  underlyingDecimals: number
): number {
  const netDecimals = underlyingDecimals - quoteDecimals;
  let strike: number;
  if (netDecimals > 0) {
    strike =
      quoteAmount.mul(new BN(10).pow(new BN(netDecimals))).toNumber() /
      underlyingAmount.toNumber();
  } else {
    strike =
      quoteAmount
        .div(new BN(10).pow(new BN(Math.abs(netDecimals))))
        .toNumber() / underlyingAmount.toNumber();
  }
  return strike;
}


/*import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import { useSetExercisedOption } from "../../context/ExercisedOptionContext";
import { tokenAccountsMap } from "../../recoil";
import { usePsyAmericanProgram } from "../usePsyAmericanProgram";
*/

export const useExerciseOptions = async (
  amount: any,
  optionMarket: OptionMarketWithKey,
  program: any,
  tokenAccounts: any,
  connection: any,
  wallet: any
) => {

  const publicKey = wallet.publicKey;


  // Look up the user's token account
  let walletUnderlyingTokenAddress = tokenAccounts[optionMarket.underlyingAssetMint.toString()]?.tokenAccountAddress;

  const walletOptionTokenAddress = tokenAccounts[optionMarket.optionMint.toString()].tokenAccountAddress;

  const walletQuoteTokenAddress = tokenAccounts[optionMarket.quoteAssetMint.toString()].tokenAccountAddress;

  const transaction = new Transaction();

  const ix = await instructions.exerciseOptionsV2Instruction(
    program,
    new BN(amount),
    optionMarket as OptionMarketWithKey,
    walletOptionTokenAddress,
    walletUnderlyingTokenAddress,
    walletQuoteTokenAddress
  );

  transaction.add(ix);

  const txHash = await sendTransaction(connection, wallet, transaction, [])

  return txHash;
};

