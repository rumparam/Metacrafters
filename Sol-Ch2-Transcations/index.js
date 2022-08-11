//Script Descr: transfer transaction demo

// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

//generate it with generateWallet method
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        106, 213,  34, 215, 234, 253, 176,  83,  33,   9,  15,
        244, 242, 165, 185, 236, 240, 161, 194, 213,  24, 111,
        127, 138,  50, 255,   1, 213,  65, 165, 208, 225, 159,
        130,  78, 240, 164,   3,  77,  99,  21,  81, 167, 233,
         27, 105,  87, 238,  41,  49, 230, 215, 181, 195, 191,
        211, 201,  64, 184, 216,  47, 181,  99, 220
      ]            
);

function generateWallet()
{
    const newWallet = Keypair.generate();
    console.log(newWallet);
}

const airDropSol = async (solAmount) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        
        var myWallet = await Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

        // Airdrop Sol
        console.log("Airdropping " + solAmount + " SOL to my sender wallet!");
        
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(myWallet.publicKey),
            solAmount * LAMPORTS_PER_SOL
        );
      
        // Latest blockhash (unique identifer of the block) of the cluster
        let latestBlockHash = await connection.getLatestBlockhash();

        // Confirm transaction using the last valid block height (refers to its time)
        // to check for transaction expiration
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: fromAirDropSignature
        });

        const walletBalance = await connection.getBalance(myWallet.publicKey);
        console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
        
    } catch (err) {
        console.log(err);
    }

    console.log("Airdrop completed for the Sender account");
};

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var senderWallet = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Generate another Keypair (account we'll be sending to)
    const receiverWallet = Keypair.generate();

    //Get balances of the wallets before transfer
    let senderBalance = await connection.getBalance(senderWallet.publicKey);
    let receiverBalance = await connection.getBalance(receiverWallet.publicKey);

    console.log(`\nBalances before transfer:\nSender wallet balance: ${parseInt(senderBalance) / LAMPORTS_PER_SOL} SOL
Receiver wallet balance: ${parseInt(receiverBalance) / LAMPORTS_PER_SOL} SOL`);

    // Send half of the balance (50%) from "sender" wallet to "receiver" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: senderWallet.publicKey,
            toPubkey: receiverWallet.publicKey,
            lamports: senderBalance / 2         //sender balance already in lamports
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [senderWallet]
    );
    console.log('Signature is ', signature);

    //Get balances of the wallets after transfer
    senderBalance = await connection.getBalance(senderWallet.publicKey);
    receiverBalance = await connection.getBalance(receiverWallet.publicKey);

    console.log(`\nBalances after transfer:\nSender wallet balance: ${parseInt(senderBalance) / LAMPORTS_PER_SOL} SOL
Receiver wallet balance: ${parseInt(receiverBalance) / LAMPORTS_PER_SOL} SOL`);
}

const mainFunction = async () => {
    //max airdrop value is 2, more than that doesn't work
    await airDropSol(1);

    await transferSol();
}

mainFunction();