"use client";

import {
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  Connection,
} from "@solana/web3.js";

import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createTransferInstruction,
  createMintToCheckedInstruction,
  createBurnCheckedInstruction,
} from "@solana/spl-token";
import { ReactNode, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const HELIUS_API = "";
  const connection = new Connection(
    `https://devnet.helius-rpc.com/?api-key=${HELIUS_API}`
  );

  const wallet = useWallet();

  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [transferAmount, setTransferAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");

  const handleSignature = async (tx: Transaction) => {
    try {
      console.log("Sending transaction...");
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "processed");
      console.log("Transaction signature:", signature);
      return signature;
    } catch (error) {
      console.error("Error sending transaction:", error);
      return null;
    }
  };

  const handleCreateToken = async () => {
    if (!publicKey) {
      console.error("Wallet not connected");
      return;
    }
    console.log("Creating token...");

    const decimal = 9;
    const mint = Keypair.generate();
    const lamports_value = await getMinimumBalanceForRentExemptMint(connection);

    let tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: lamports_value,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        decimal,
        publicKey,
        publicKey
      )
    );

    await handleSignature(tx);
  };

  const handleTransfer = async () => {
    if (!publicKey || !transferAmount || !recipient) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    const recipientPubkey = new PublicKey(recipient);
    const onCurve = PublicKey.isOnCurve(recipientPubkey);

    if (!onCurve) {
      console.error("Invalid recipient address");
      return;
    }

    console.log("Transferring tokens...");

    const tx = new Transaction().add(
      createTransferInstruction(
        publicKey,
        PublicKey.default,
        new PublicKey(recipient),
        Number(transferAmount),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const sign = await handleSignature(tx);
    if (sign != null) console.log("Transfer completed");
  };

  const handleMint = async () => {
    if (!publicKey || !mintAmount) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    console.log("Minting tokens...");

    const mintPubkey = "YOUR_MINT_PUBLIC_KEY_HERE";
    const mintPublicKey = new PublicKey(mintPubkey);

    const tx = new Transaction().add(
      createMintToCheckedInstruction(
        mintPublicKey,
        publicKey,
        publicKey,
        Number(mintAmount),
        0
      )
    );

    const sign = await handleSignature(tx);
    if (sign != null) console.log("Minting completed");
  };

  const handleBurn = async () => {
    if (!publicKey || !burnAmount) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    console.log("Burning tokens...");

    const mintPubkey = "YOUR_MINT_PUBLIC_KEY_HERE";
    const mintPublicKey = new PublicKey(mintPubkey);

    const tx = new Transaction().add(
      createBurnCheckedInstruction(
        mintPublicKey,
        publicKey,
        publicKey,
        Number(burnAmount),
        0
      )
    );

    const sign = await handleSignature(tx);
    if (sign != null) console.log("Minting completed");
  };

  const handleDelegate = async () => {
    if (!publicKey || !delegateAddress) {
      console.error("Wallet not connected or missing input fields");
      return;
    }

    if (!PublicKey.isOnCurve(new PublicKey(delegateAddress))) {
      console.error("Invalid delegate address");
      return;
    }

    console.log("Delegating tokens...");

    const mintPubkey = "YOUR_MINT_PUBLIC_KEY_HERE";
    const mintPublicKey = new PublicKey(mintPubkey);

    // const tx = new Transaction().add(
    //   createApproveInstruction(
    //     mintPublicKey,
    //     new PublicKey(delegateAddress),
    //     publicKey,
    //     [],
    //     TOKEN_PROGRAM_ID
    //   )
    // );

    // const sign = await handleSignature(tx);
    // if (sign != null) console.log("Delegation completed");
  };

  const address = publicKey;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-lg p-6 bg-gray-900 rounded-lg">
        <div className="flex justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h3 className="font-serif text-white">tokenonana</h3>
          </div>
          <div>
            <WalletMultiButtonDynamic>
              {wallet.publicKey
                ? `${wallet.publicKey.toBase58().substring(0, 7)}...`
                : "Connect Wallet"}
            </WalletMultiButtonDynamic>
          </div>
        </div>

        <div className="text-center py-4">
          <h1 className="text-2xl text-white">SPL Tokens</h1>
          <p className="text-gray-400">
            Create and interact with tokens on Solana
          </p>
        </div>
        <div className="my-4">
          <div className="text-white">
            Account: {address && address.toBase58()}
          </div>
          <button
            onClick={handleCreateToken}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg mt-2"
          >
            Create New Token
          </button>
        </div>

        <div className="space-y-8">
          <div className="my-4">
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Amount"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
            />
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient Address"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg mt-2"
            />
            <button
              onClick={handleTransfer}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg mt-2"
            >
              Transfer
            </button>
          </div>

          <div className="my-4">
            <input
              type="text"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Mint Amount"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
            />
            <button
              onClick={handleMint}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg mt-2"
            >
              Mint
            </button>
          </div>

          <div className="my-4">
            <input
              type="text"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              placeholder="Burn Amount"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
            />
            <button
              onClick={handleBurn}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg mt-2"
            >
              Burn
            </button>
          </div>

          <div className="my-4">
            <input
              type="text"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              placeholder="Delegate Address"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg"
            />
            <button
              onClick={handleDelegate}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg mt-2"
            >
              Delegate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
