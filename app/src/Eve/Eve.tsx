import React, { useEffect, useCallback, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
//import { ShdwDrive } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {LAMPORTS_PER_SOL, Connection, PublicKey, Transaction, TransactionInstruction} from '@solana/web3.js';
import { Schema, deserializeUnchecked, deserialize } from "borsh";
import { TokenAmount } from '../utils/grapeTools/safe-math';
import { GrapeEve, IDL } from '../../types/grape_eve';
import {getCommunity, getThread, EVE_PROGRAM_ID} from "../../types/pdas";
import tidl from '../../idl/grape_eve.json';
import { v4 as uuidv4 } from 'uuid';

import bs58 from 'bs58';
import BN from 'bn.js';
import LitJsSdk from "lit-js-sdk";

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
//import { GrapeEve, IDL } from "../../../target/types/grape_eve"
import dayjs from "dayjs"
var relativeTime = require('dayjs/plugin/relativeTime')

import { Thread } from '../models'

import { 
    AnchorProvider, Program, web3, IdlTypes
} from '@project-serum/anchor'

import { useSnackbar } from 'notistack';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletConnectButton } from "@solana/wallet-adapter-material-ui";

import { useTranslation } from 'react-i18next';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MUIRichTextEditor from "mui-rte";

import moment from 'moment';

import { ConnectedIdentity } from './ConnectedIdentity';
import { SocialVotes } from './Poll';
import ShareSocialURL from '../utils/grapeTools/ShareUrl';

import { 
    GRAPE_RPC_ENDPOINT
} from '../utils/grapeTools/constants';

import { styled } from '@mui/material/styles';
import {
    Box,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemAvatar,
    ListItemButton,
    Avatar,
    Tooltip,
    Typography,
    Collapse,
    ListSubheader,
    Button,
    ButtonGroup,
    CircularProgress,
    Divider,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    FormControlLabel,
    FormLabel,
    Select,
    MenuItem,
    InputLabel,
    Paper,
    Switch,
    Container,
    Radio,
    RadioGroup,
    LinearProgress,
    Stack
} from '@mui/material';

import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
} from '@mui/lab';

import {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';

import GrapeIcon from "../components/static/GrapeIcon";
import SolanaIcon from "../components/static/SolIcon";
import SolCurrencyIcon from '../components/static/SolCurrencyIcon';

import HubIcon from '@mui/icons-material/Hub';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LinkIcon from '@mui/icons-material/Link';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';

import { buffer } from "node:stream/consumers";
import { responsiveProperty } from "@mui/material/styles/cssUtils";
import {createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT} from "@solana/spl-token-v2";

const myTheme = createTheme({
    // Set up your custom MUI theme here
});

const Input = styled('input')({
    display: 'none',
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));

function isImage(url:string) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

let workspace = null

export const useWorkspace = () => workspace
  
export function EveView(props: any){
	//const geconnection = new Connection(GRAPE_RPC_ENDPOINT);
    const geconnection = new Connection("https://api.devnet.solana.com", "confirmed");
    //const { connection } = useConnection();

    const client = new LitJsSdk.LitNodeClient();
    
	const wallet = useWallet();
    const {publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = React.useState(false);
    const [loadingThreads, setLoadingThreads] = React.useState(false);
    const [loadingCommunities, setLoadingCommunities] = React.useState(false);
    
    const [filterThread, setFilterThread] = React.useState(null);
    const {handlekey} = useParams<{ handlekey: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlParams = searchParams.get("thread") || searchParams.get("address") || handlekey;
    const [threads, setThreads] = React.useState(null);
    const [threadReplies, setThreadReplies] = React.useState(null);

    const [threadCount, setThreadCount] = React.useState(0);
    const [postCount, setPostCount] = React.useState(0);
    const [replyCount, setReplyCount] = React.useState(0);

    const [communities, setCommunities] = React.useState(null);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error);
        },
        [enqueueSnackbar]
    );

    function created_at (date:number) {
        return moment.unix(date).format('lll');
    }

    function created_ago (blockTime:number) {
        try{
            let prettydate = moment.unix(+blockTime).format("MMMM Do YYYY, h:mm a");
                        //console.log("prettyForSaleDate: "+prettyForSaleDate)
            let timeago = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asDays().toFixed(0);
            //console.log("Time Ago: "+timeago);
            if (+timeago >= 1){
                if (+timeago === 1)
                    prettydate = timeago+' day ago';
                else
                    prettydate = timeago+' days ago';
            } else{
                let hoursago = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asHours().toFixed(0);
                if (+hoursago >= 1){
                    if (+hoursago === 1)
                        prettydate = hoursago+' hour ago';
                    else
                        prettydate = hoursago+' hours ago';
                } else {
                    let minutesAgo = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asMinutes().toFixed(0);
                    if (+minutesAgo >= 1){
                        if (+minutesAgo === 1)
                            prettydate = minutesAgo+' minute ago';
                        else
                            prettydate = minutesAgo+' minutes ago';
                    } else {
                        let secondsAgo = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asSeconds().toFixed(0);
                        if (+secondsAgo >= 1){
                            if (+secondsAgo === 1)
                                prettydate = secondsAgo+' second ago';
                            else
                                prettydate = secondsAgo+' seconds ago';
                        }
                    }
                }
            }  
    
            return prettydate;
        }catch(e){
            return blockTime;
        }
    }

    //export const  initWorkspace = () => {
    async function initWorkspace() {  
        
        await client.connect();
        window.litNodeClient = client;

        const clusterUrl = 'https://api.devnet.solana.com'; //'https://ssc-dao.genesysgo.net/';//process.env.VUE_APP_CLUSTER_URL
        const grapeEveId = EVE_PROGRAM_ID;
        const programID = new PublicKey(grapeEveId);
        
        const connection = new Connection(clusterUrl)

        async function getProvider() {
            /* create the provider and return it to the caller */
            /* network set to local network for now */
            const connection = new Connection(clusterUrl);
            
            //const provider = new AnchorProvider(
            const provider = new AnchorProvider(
                    connection, wallet, {
                commitment: "processed"
            },
            );
            return provider;
        }

        const provider = await getProvider()
        const program = new Program<GrapeEve>(IDL, programID, provider);
        //const program = new Program(tidl, programID, provider);
        
        //const litclient = new LitJsSdk.LitNodeClient();
        //const chain = 'solana'

        //await litclient.connect()
        //window.litNodeClient = litclient

        //console.log( "threads: + "+JSON.stringify(program.account.thread.all([]) ));

        workspace = {
            wallet,
            connection,
            provider,
            program,
            //litclient
        }
    }

    const accessControlConditions = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'solana',
          method: 'sol_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '1000000000000',  // 0.000001 SOL
          },
        },
      ]

    /*
    const encrypt = async (message: string) => {
    //async encrypt(message: string) {
        if (!this.litNodeClient) {
          await this.connect()
        }
    
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(message)
    
        const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
          accessControlConditions,
          symmetricKey,
          authSig,
          chain,
        })
    
        return {
          encryptedString,
          encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
        }
      }
    */

    


    async function getOrCreateTokenAccountInstruction(mint: PublicKey, user: PublicKey, connection: Connection, payer: PublicKey|null = null): Promise<TransactionInstruction | null> {
        const userTokenAccountAddress = await getAssociatedTokenAddress(mint, user, false);
        const userTokenAccount = await connection.getParsedAccountInfo(userTokenAccountAddress);
        if (userTokenAccount.value === null) {
            return createAssociatedTokenAccountInstruction(payer ? payer : user, userTokenAccountAddress, user, mint);
        } else {
            return null;
        }
    }

    const newCommunity = async (title:string, metadata:string, _mint:PublicKey, _uuid: string) => {
        await initWorkspace();
        const { program, connection, wallet } = useWorkspace()

        const uuid = uuidv4().slice(0, 6);
        console.log(`uuid ${JSON.stringify(uuid, null, 2)}`);
        console.log(`uuid ${typeof uuid}`)
        const [community] = await getCommunity(uuid);
        console.log(`community ${community.toBase58()}`)

        try{
            enqueueSnackbar(`Preparing to create a new community`,{ variant: 'info' });
            const args: IdlTypes<GrapeEve>["CreateCommunityArgs"] = {
                title: title,
                metadata: metadata,
                uuid: uuid
            }
            const accounts = {
                owner: publicKey,
                mint: NATIVE_MINT,
                community: community
            }
            const tokenInstruction: TransactionInstruction = await getOrCreateTokenAccountInstruction(NATIVE_MINT, publicKey, connection);
            const createCommunityInstruction: TransactionInstruction = await program.methods
                .createCommunity(args)
                .accounts(accounts)
                .instruction()

            const blockDetails = await connection.getLatestBlockhash();
            const transaction = new Transaction();
            transaction.recentBlockhash = blockDetails.blockhash;
            transaction.feePayer = publicKey;
            for (const i of [tokenInstruction, createCommunityInstruction]) {
                if (i) {
                    transaction.add(i);
                }
            }

            const signedTransaction = await sendTransaction(transaction, connection, {
                skipPreflight: true,
                preflightCommitment: "confirmed"
            });
            console.log(`signedTransaction ${signedTransaction}`)
            //const conf = await connection.confirmTransaction(signedTransaction);
            //console.log(`conf ${JSON.stringify(conf, null, 2)}`);
            
            //const communityAccount = await program.account.community.fetch(community);
            
            const snackprogress = (key:any) => (
                <CircularProgress sx={{padding:'10px'}} />
            );
            const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
            const latestBlockHash = await geconnection.getLatestBlockhash();
            await geconnection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signedTransaction}, 
                'finalized'
            );
            closeSnackbar(cnfrmkey);
            
            const snackaction = (key:any) => (
                <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                    {signedTransaction}
                </Button>
            );
            enqueueSnackbar(`Community created`,{ variant: 'success', action:snackaction });
            
            // do a refresh this is not efficient we should simply 
            // do a dynamic push/popup on the object and avoid the additional rpc call
            fetchCommunities();
        } catch(e:any){
            closeSnackbar();
            enqueueSnackbar(e.message ? `${e.name}: ${e.message}` : e.name, { variant: 'error' });
            //enqueueSnackbar(`Error: ${e}`,{ variant: 'error' });
            console.log("Error: "+e);
            //console.log("Error: "+JSON.stringify(e));
        } 
        
    }
    
    function DeleteCommunity(props:any){
        const community = props.community;
        
        const deleteCommunity = async () => {
            await initWorkspace();
            const { wallet, provider, program } = useWorkspace()
            const filter = [communityThreadsFilter(community.toBase58())]
            const existingThreads = await fetchThreads(filter, true);

            console.log("deleting: "+community.toBase58() + " from: "+publicKey.toBase58());

           try{
                if (existingThreads.length === 0){
                    enqueueSnackbar(`Preparing to delete community`,{ variant: 'info' });
                    
                    const signedTransaction = await program.rpc.deleteCommunity({
                        accounts: {
                            author: publicKey,
                            community: community,
                        },
                    })
                    
                    const snackprogress = (key:any) => (
                        <CircularProgress sx={{padding:'10px'}} />
                    );
                    const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
                    const latestBlockHash = await geconnection.getLatestBlockhash();
                    await geconnection.confirmTransaction({
                        blockhash: latestBlockHash.blockhash,
                        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                        signature: signedTransaction}, 
                        'finalized'
                    );
                    closeSnackbar(cnfrmkey);
                    
                    const snackaction = (key:any) => (
                        <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                            {signedTransaction}
                        </Button>
                    );
                    enqueueSnackbar(`Deleting community`,{ variant: 'success', action:snackaction });
                
                    console.log("signature: "+JSON.stringify(signedTransaction));
                    // do a refresh this is not efficient we should simply 
                    // do a dynamic push/popup on the object and avoid the additional rpc call
                    fetchCommunities();
                } else {
                    enqueueSnackbar(`Unable to delete! Communities can be deleted once all posts have been removed`,{ variant: 'error' });
                }
            } catch(e:any){
                closeSnackbar();
                enqueueSnackbar(e.message ? `${e.name}: ${e.message}` : e.name, { variant: 'error' });
                //enqueueSnackbar(`Error: ${e}`,{ variant: 'error' });
                console.log("Error: "+e);
                //console.log("Error: "+JSON.stringify(e));
            } 
        }

        return (

            <Button
                variant="outlined"
                onClick={deleteCommunity}
                sx={{borderRadius:'17px',ml:1}}
                color="error"
            >
                    <DeleteIcon />
            </Button>
        )
    }

    const newPost = async (topic:string, content:string, metadata: string, threadType: number, encrypted: boolean, community:PublicKey, reply: PublicKey, ends: BN ) => {
        await initWorkspace();
        const { program, connection, wallet } = useWorkspace()

        const uuid = uuidv4().slice(0, 6);
        const [thread] = await getThread(uuid);
        //const [thread] = await getThread(THREAD_UUID);
        //const thread_author = web3.Keypair.generate();
        //const thread = web3.Keypair.generate()
        //console.log("posting: "+topic+" - "+content+" - "+metadata+" - "+community+" - "+threadType+" - "+encrypted+" - "+(reply))
        try{
            enqueueSnackbar(`Preparing to create a new post`,{ variant: 'info' });
            
            console.log("community: "+(community && community.toBase58()))
            const communityAccount = await program.account.community.fetch(community);
            const author_token_account = await getAssociatedTokenAddress(communityAccount.mint, publicKey);
            const args: IdlTypes<GrapeEve>["CreateThreadArgs"] = {
                replyTo: reply.toBase58(),
                threadType: threadType,
                isEncrypted: false,
                topic: topic,
                content: content,
                metadata: metadata,
                uuid: uuid,
                ends: new BN(0),
            }
            const accounts = {
                author: publicKey,
                mint: communityAccount.mint,
                community: community,
                authorTokenAccount: author_token_account,
                thread: thread,
                rent: web3.SYSVAR_RENT_PUBKEY,
                systemProgram: web3.SystemProgram.programId,
            }
            const tokenInstruction: TransactionInstruction = await getOrCreateTokenAccountInstruction(NATIVE_MINT, publicKey, connection);
            const createThreadInstruction: TransactionInstruction = await program.methods
                .createThread(args)
                .accounts(accounts)
                .instruction()
            
            const blockDetails = await connection.getLatestBlockhash();
            const transaction = new Transaction();
            transaction.recentBlockhash = blockDetails.blockhash;
            transaction.feePayer = publicKey;
            for (const i of [tokenInstruction, createThreadInstruction]) {
                if (i) {
                    transaction.add(i);
                }
            }

            const signedTransaction = await sendTransaction(transaction, connection, {
                skipPreflight: true,
                preflightCommitment: "confirmed"
            });
            console.log(`signedTransaction ${signedTransaction}`)
            
            /*const args: IdlTypes<GrapeEve>["CreateThreadArgs"] = {
                replyTo: reply.toBase58(),
                threadType: threadType,
                isEncrypted: false,
                topic: topic,
                content: content,
                metadata: metadata,
                uuid: uuid,
                ends: new BN(0),
            };*/
            //const transferAuthority = web3.Keypair.generate();
            //const signers = true ? [] : [transferAuthority];
            //const signers = [];
            //const signers = [transferAuthority];
            //console.log('signers:',signers);
            //const communityAccount = await program.account.community.fetch(community);
            //const author_token_account = await getAssociatedTokenAddress(communityAccount.mint, publicKey);
            /*const signedTransaction = await program.rpc.createThread(
                args, {
                accounts: {
                    author: publicKey,
                    //author: thread_author.publicKey,
                    mint: communityAccount.mint,
                    community: community,
                    authorTokenAccount: author_token_account,
                    //thread: thread.publicKey,
                    thread: thread,
                    rent: web3.SYSVAR_RENT_PUBKEY,
                    //rent:1.0,
                    systemProgram: web3.SystemProgram.programId,
                    
                //},
                signers: [thread],

            })
            //console.log('1');
            */


            const snackprogress = (key:any) => (
                <CircularProgress sx={{padding:'10px'}} />
            );
            const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
            const latestBlockHash = await geconnection.getLatestBlockhash();
            await geconnection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signedTransaction}, 
                'finalized'
            );
            closeSnackbar(cnfrmkey);

            const snackaction = (key:any) => (
                <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                    {signedTransaction}
                </Button>
            );
            enqueueSnackbar(`Post created`,{ variant: 'success', action:snackaction });
            
            // do a refresh this is not efficient we should simply 
            // do a dynamic push/popup on the object and avoid the additional rpc call
            fetchThreads(null, false);
        } catch(e:any){
            closeSnackbar();
            enqueueSnackbar(e.message ? `${e.name}: ${e.message}` : e.name, { variant: 'error' });
            //enqueueSnackbar(`Error: ${e}`,{ variant: 'error' });
            console.log("Error: "+e);
            //console.log("Error: "+JSON.stringify(e));
        } 
    }

    const editPost = async (thread: PublicKey, topic:string, content:string, metadata:string, threadType:number, community:PublicKey, encrypted:number, reply:PublicKey) => {
        await initWorkspace();
        const { program, connection, wallet } = useWorkspace()
        console.log('reply PK:', reply.toBase58());
        try{
            //const thread = web3.Keypair.generate()
            //const uuid = uuidv4().slice(0, 6);
            enqueueSnackbar(`Preparing to edit post`,{ variant: 'info' });
            //enqueueSnackbar(`Preparing to edit post ${publicKey.toBase58()} from ${thread.toBase58()})`,{ variant: 'info' });
            //enqueueSnackbar(`${topic} - Message ${content})`,{ variant: 'info' });
            const communityAccount = await program.account.community.fetch(community);
            const author_token_account = await getAssociatedTokenAddress(communityAccount.mint, publicKey);
            const args: IdlTypes<GrapeEve>["UpdateThreadArgs"] = {
                replyTo: reply.toBase58(),
                threadType: threadType,
                isEncrypted: false,
                topic: topic,
                content: content,
                metadata: metadata,
                ends: new BN(0),
            }
            const accounts = {
                author: publicKey,
                mint: communityAccount.mint,
                community: community,
                authorTokenAccount: author_token_account,
                thread: thread,
                rent: web3.SYSVAR_RENT_PUBKEY,
                systemProgram: web3.SystemProgram.programId,
            }
            const tokenInstruction: TransactionInstruction = await getOrCreateTokenAccountInstruction(NATIVE_MINT, publicKey, connection);
            const updateThreadInstruction: TransactionInstruction = await program.methods
                .updateThread(args)
                .accounts(accounts)
                .instruction()
            const blockDetails = await connection.getLatestBlockhash();
            const transaction = new Transaction();
            transaction.recentBlockhash = blockDetails.blockhash;
            transaction.feePayer = publicKey;
            for (const i of [tokenInstruction, updateThreadInstruction]) {
                if (i) {
                    transaction.add(i);
                }
            }
            
            const signedTransaction = await sendTransaction(transaction, connection, {
                skipPreflight: true,
                preflightCommitment: "confirmed"
            });
            console.log(`signedTransaction ${signedTransaction}`)

            const snackprogress = (key:any) => (
                <CircularProgress sx={{padding:'10px'}} />
            );
            const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
            const latestBlockHash = await geconnection.getLatestBlockhash();
            await geconnection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signedTransaction}, 
                'finalized'
            );
            closeSnackbar(cnfrmkey);

            const snackaction = (key:any) => (
                <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                    {signedTransaction}
                </Button>
            );
            enqueueSnackbar(`Edit complete!`,{ variant: 'success', action:snackaction });
            
            // do a refresh this is not efficient we should simply 
            // do a dynamic push/popup on the object and avoid the additional rpc call
            fetchThreads(null, false);
        } catch(e:any){
            closeSnackbar();
            enqueueSnackbar(e.message ? `${e.name}: ${e.message}` : e.name, { variant: 'error' });
            //enqueueSnackbar(`Error: ${e}`,{ variant: 'error' });
            console.log("Error: "+e);
            //console.log("Error: "+JSON.stringify(e));
        } 
    }

    function DeletePost(props:any){
        const thread = props.thread;
        const community = props.community;
        
        const deletePost = async () => {
            await initWorkspace();
            //const { wallet, provider, program } = useWorkspace()
            const { program, connection, wallet } = useWorkspace()
    
            console.log("deleting: "+thread.toBase58() + " from: "+publicKey.toBase58());

            try{
                enqueueSnackbar(`Preparing to delete post`,{ variant: 'info' });
                /*const signedTransaction = await program.rpc.deletePost({
                    accounts: {
                        author: publicKey,
                        thread: thread,
                    },
                })*/
                const communityAccount = await program.account.community.fetch(community);
                const author_token_account = await getAssociatedTokenAddress(communityAccount.mint, publicKey);
                const accounts = {
                    author: publicKey,
                    thread: thread,
                    community: community,
                    mint: communityAccount.mint,
                    authorTokenAccount: author_token_account,
                }
                const tokenInstruction: TransactionInstruction = await getOrCreateTokenAccountInstruction(NATIVE_MINT, publicKey, connection);
                const deleteThreadInstruction: TransactionInstruction = await program.methods
                .deleteThread()
                .accounts(accounts)
                .instruction()

                const blockDetails = await connection.getLatestBlockhash();
                const transaction = new Transaction();
                transaction.recentBlockhash = blockDetails.blockhash;
                transaction.feePayer = publicKey;
                for (const i of [tokenInstruction, deleteThreadInstruction]) {
                    if (i) {
                        transaction.add(i);
                    }
                }

                const signedTransaction = await sendTransaction(transaction, connection, {
                    skipPreflight: true,
                    preflightCommitment: "confirmed"
                });
                console.log(`signedTransaction ${signedTransaction}`)

                const snackprogress = (key:any) => (
                    <CircularProgress sx={{padding:'10px'}} />
                );
                const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
                const latestBlockHash = await geconnection.getLatestBlockhash();
                await geconnection.confirmTransaction({
                    blockhash: latestBlockHash.blockhash,
                    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                    signature: signedTransaction}, 
                    'finalized'
                );
                closeSnackbar(cnfrmkey);
        
                const snackaction = (key:any) => (
                    <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                        {signedTransaction}
                    </Button>
                );
                enqueueSnackbar(`Deleting post`,{ variant: 'success', action:snackaction });
            
                console.log("signature: "+JSON.stringify(signedTransaction));
                // do a refresh this is not efficient we should simply 
                // do a dynamic push/popup on the object and avoid the additional rpc call
                fetchThreads(null, false);
            } catch(e:any){
                closeSnackbar();
                enqueueSnackbar(e.message ? `${e.name}: ${e.message}` : e.name, { variant: 'error' });
                //enqueueSnackbar(`Error: ${e}`,{ variant: 'error' });
                console.log("Error: "+e);
                //console.log("Error: "+JSON.stringify(e));
            } 
        }

        return (

            <Button
                variant="outlined"
                onClick={deletePost}
                sx={{borderRadius:'17px',ml:1}}
                color="error"
            >
                    <DeleteIcon />
            </Button>
        )
    }

    function CommunityView(props:any){
        const ml = props?.ml || 0;
        const mr = props?.mr || 0;
        const type = props?.type;
        const [openPreviewDialog, setOpenPreviewDialog] = React.useState(false);

        const [community, setCommunity] = React.useState(props?.community || new PublicKey(0));
        const [communityName, setCommunityName] = React.useState(props?.communityName || null);
        const [communityMint, setCommunityMint] = React.useState(props?.communityMint || new PublicKey(0));
        const [uuid, setUUID] = React.useState(props?.uuid || null);
        
        const {publicKey} = useWallet();

        const handleClickOpenPreviewDialog = () => {
            setOpenPreviewDialog(true);
        };
        
        const handleClosePreviewDialog = () => {
            setOpenPreviewDialog(false);
        };

        async function handlePostNow(event: any) {
            event.preventDefault();
            handleClosePreviewDialog();
            
            //console.log("posting: ("+topic+") "+message);
            
            if (type === 0){

                const metadata = '';
                const thiscommunity = await newCommunity(communityName, metadata, communityMint, uuid);
                console.log("New: "+JSON.stringify(thiscommunity));
            } else {
                //const thisthread = await editCommunity(thread, topic, message, community, encrypted);
                //console.log("Edit: "+JSON.stringify(thisthread));
            }
        }

        return (

            <>
                {publicKey &&
                <Button
                    variant="outlined"
                    //component={Link} to={`${GRAPE_PREVIEW}${item.mint}`}
                    onClick={handleClickOpenPreviewDialog}
                    sx={{borderRadius:'17px',mr:mr,ml:ml,color:'white'}}
                >
                    {type === 0 ?
                        <><AddCircleIcon sx={{mr:1}} /> Community</>
                    :
                        <><EditIcon sx={{mr:1}}/> Community</>
                    }
                </Button>
                }
                <BootstrapDialog 
                    fullWidth={true}
                    maxWidth={"lg"}
                    open={openPreviewDialog} onClose={handleClosePreviewDialog}
                    PaperProps={{
                        style: {
                            background: '#13151C',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px'
                        }
                    }}
                >
                    <form onSubmit={handlePostNow}>
                        <DialogContent>

                            {community &&
                                <Typography variant='h6'>
                                    {type === 0 ?
                                     <>Add Community</>
                                    :
                                        <>
                                            <>Editing</>
                                            &nbsp;{community.toBase58()}
                                        </>
                                    }
                                </Typography>
                            }
                            <br/>
                            
                            <FormControl fullWidth sx={{m:1,mt:2}}>
                                <TextField 
                                    fullWidth 
                                    label="Community Name" 
                                    id="fullWidth" 
                                    value={communityName}
                                    onChange={(e: any) => {
                                        if (e.target.value.length <= 50)
                                            setCommunityName(e.target.value)}
                                    }/>
                                <Typography>{50 - (communityName?.length | 0)} left</Typography>
                            </FormControl>
                            
                            <FormControl fullWidth sx={{m:1,mt:2}}>
                                <TextField 
                                    fullWidth 
                                    label="Community Mint" 
                                    id="fullWidth" 
                                    value={communityMint}
                                    onChange={(e: any) => {
                                        //if (e.target.value.length <= 32)
                                        setCommunityMint(e.target.value)}
                                    }/>
                                <Typography>{44 - (communityMint?.length | 0)} left</Typography>
                            </FormControl>

                            {/*
                            <FormControl fullWidth>
                                <TextField 
                                    fullWidth 
                                    label="Reply" 
                                    id="fullWidth" 
                                    value={reply}
                                    onChange={(e: any) => {
                                        setReply(e.target.value)}
                                    }/>
                            </FormControl>
                            */}
                        </DialogContent>
                        <DialogActions>
                            <Button variant="text" onClick={handleClosePreviewDialog}>Cancel</Button>
                            <Button 
                                type="submit"
                                variant="text" 
                                disabled={
                                    (+communityName?.length > 50) || (+communityName?.length <= 0)
                                }
                                title="Submit">
                                SUBMIT
                            </Button>
                        </DialogActions>
                    </form>
                </BootstrapDialog>

            </>

        )
    }
    
    function PostView(props:any){
        const ml = props?.ml || 0;
        const mr = props?.mr || 0;
        const type = props?.type;
        const thread = props?.thread;
        const [openPreviewDialog, setOpenPreviewDialog] = React.useState(false);
        const [encrypted, setEncrypted] = React.useState(props?.encrypted || false);
        const [message, setMessage] = React.useState(props?.message || null);
        const [topic, setTopic] = React.useState(props?.topic || null);
        const [community, setCommunity] = React.useState((props?.community && new PublicKey(props.community)) || new PublicKey(0));
        const communities = props.communities || null;
        const [reply, setReply] = React.useState(((type=== 2 || type===1) && props?.thread && new PublicKey(props.thread)) || new PublicKey(0));
        /*const [replyPk, getReply] = React.useState((type===2 && props?.reply && new PublicKey(props.reply)) || 
                                                    (type===1 && props?.reply && new PublicKey(props.reply) != new PublicKey(0) && new PublicKey(props.reply)) ||
                                                    new PublicKey(0));*/
        const [replyPk, getReply] = React.useState(((type=== 2 || type===1) && props?.reply && new PublicKey(props.reply)) );
        const {publicKey} = useWallet();

        const handleClickOpenPreviewDialog = () => {
            setOpenPreviewDialog(true);
        };
        
        const handleClosePreviewDialog = () => {
            setOpenPreviewDialog(false);
        };

        async function handlePostNow(event: any) {
            event.preventDefault();
            handleClosePreviewDialog();
            
            console.log("posting: ("+topic+") "+message);
            
            if (type === 0){
                const metadata = '';
                console.log("new post: "+reply.toBase58())
                const thisthread = await newPost(topic, message, metadata, 0, encrypted, community, reply, new BN(0));
                console.log("New: "+JSON.stringify(thisthread));
            } else if (type === 1){
                const metadata = '';
                console.log("edit post: "+replyPk.toBase58())
                const thisthread = await editPost(thread, topic, message, metadata, 1, community, encrypted, replyPk);
                console.log("Edit: "+JSON.stringify(thisthread));
            } else if (type === 2){
                const metadata = '';
                console.log("reply to post: "+reply.toBase58())
                const thisthread = await newPost(topic, message, metadata, 2, encrypted, community, reply, new BN(0));
                console.log("Reply: "+JSON.stringify(thisthread));
            }
        }

        return (

            <>
                {publicKey &&
                <Button
                    variant="outlined"
                    //component={Link} to={`${GRAPE_PREVIEW}${item.mint}`}
                    onClick={handleClickOpenPreviewDialog}
                    sx={{borderRadius:'17px',mr:mr,ml:ml,color:'white'}}
                    disabled={!communities}
                >
                    {type === 0 ?
                        <><AddCircleIcon /></>
                    :
                        <>
                            {type === 1 ?
                                <><EditIcon /></>
                            :
                                <><ReplyIcon /></>
                            }
                        </>
                    }
                </Button>
                }
                <BootstrapDialog 
                    fullWidth={true}
                    maxWidth={"lg"}
                    open={openPreviewDialog} onClose={handleClosePreviewDialog}
                    PaperProps={{
                        style: {
                            background: '#13151C',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px'
                        }
                    }}
                >
                    <form onSubmit={handlePostNow}>
                        <DialogContent>

                            {thread &&
                                <Typography variant='h6'>
                                    {reply && reply.toBase58() !== new PublicKey(0).toBase58() && type===2 ? 
                                        <>Replying to {thread.toBase58()}</>
                                    :   
                                        <> {replyPk.toBase58() != new PublicKey(0).toBase58() ? <>Editing reply to {replyPk.toBase58()} </>: <>Editing</>}</>

                                    }
                                </Typography>
                            }
                            <br/>
                            <FormControl fullWidth sx={{m:1}}>
                                <InputLabel id="demo-simple-select-label">Community</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Community"
                                    value={community}
                                    disabled={(reply && reply.toBase58() !== new PublicKey(0).toBase58() && type===2) || (replyPk && replyPk.toBase58() != new PublicKey(0).toBase58()) ? 
                                        true :
                                        false
                                    }
                                    onChange={(e: any) => {
                                        setCommunity(new PublicKey(e.target.value))}
                                    }
                                >
                                    

                                    {communities && communities.map((community:any,key:number) => {
                                        return (
                                            <MenuItem value={community.publicKey.toBase58()} key={key}>{community.account.title}</MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth sx={{m:1,mt:2}}>
                                <TextField 
                                    fullWidth 
                                    label="Topic" 
                                    id="fullWidth" 
                                    disabled={(reply && reply.toBase58() !== new PublicKey(0).toBase58() && type===2) || (replyPk && replyPk.toBase58() != new PublicKey(0).toBase58()) ? true : false}
                                    value={topic}
                                    onChange={(e: any) => {
                                        if (e.target.value.length <= 50)
                                            setTopic(e.target.value)}
                                    }/>
                                
                                {reply && reply.toBase58() !== new PublicKey(0).toBase58() && type===2 ? <></> : <Typography>{50 - (topic?.length | 0)} left</Typography>}
                            </FormControl>
                            <FormControl fullWidth sx={{m:1,mt:2}}>
                                <TextField
                                    id="filled-multiline-static"
                                    label={reply && reply.toBase58() !== new PublicKey(0).toBase58() && type===2 ? "Reply to this thread" : "Start a discussion"}
                                    multiline
                                    rows={4}
                                    value={message}
                                    onChange={(e: any) => {
                                        setMessage(e.target.value)}
                                    }
                                    />
                                <Typography>{160 - (message?.length | 0)} left</Typography>
                            </FormControl>
                            
                            {/*
                            <FormControl fullWidth sx={{m:1}}>
                                <MUIRichTextEditor
                                    label="Type something here..."
                                    onSave={(e: any) => {
                                        setMessage(e)}
                                    }
                                    inlineToolbar={true}
                                />
                                
                            </FormControl>
                            */}
                            
                            <br/><br/>

                            <FormControlLabel control={<Switch disabled />} label="Encrypted" />

                            {/*
                            <FormControl fullWidth>
                                <TextField 
                                    fullWidth 
                                    label="Reply" 
                                    id="fullWidth" 
                                    value={reply}
                                    onChange={(e: any) => {
                                        setReply(e.target.value)}
                                    }/>
                            </FormControl>
                            */}
                        </DialogContent>
                        <DialogActions>
                            <Button variant="text" onClick={handleClosePreviewDialog}>Cancel</Button>
                            <Button 
                                type="submit"
                                variant="text" 
                                disabled={
                                    (+message?.length > 280) || (+message?.length <= 0)
                                }
                                title="Submit">
                                SUBMIT
                            </Button>
                        </DialogActions>
                    </form>
                </BootstrapDialog>

            </>

        )
    }

    const communityFilter = community58PublicKey => ({
        memcmp: {
            offset: 8 + // Discriminator.
                    1 + //bump
                    32 + // Author public key.
                    8, // Timestamp
            bytes: community58PublicKey,
        }
    })

    const fetchFilteredCommunity = (publicKey:any, mint:any, owner:any) => {
        //console.log('community publicKey:', publicKey.toBase58());
        const filter = [communityFilter(publicKey.toBase58())]
        fetchCommunities(filter);
    }

    const threadFilter = async (pubkey: string) => {
        if (pubkey && pubkey.length){
            setLoadingThreads(true);
            await initWorkspace();
            const { program } = await useWorkspace()
            
            //const threadlen = await program.account.thread.all.length
            
            const thread = await program.account.thread.fetch(pubkey);

            console.log("t: "+JSON.stringify(thread));
            //return thread;
            thread.publicKey = new PublicKey(pubkey);

            // here we can split the threads to primary and responses
            //if (thread.replyTo)
            //{item?.reply && item?.reply.toBase58() !== new PublicKey(0).toBase58() &&
            setThreadReplies([thread]);

            setThreads([thread]);
            setLoadingThreads(false);     
            return [thread];
        } else{
            //fetchThreads(null, false);
            fetchThreads([onlyTopicsFilter(new PublicKey(0).toBase58())],false);
        }
        
    }

    const fetchCommunities = async (filters = []) => {
        setLoadingCommunities(true);
        await initWorkspace();
        const { program } = await useWorkspace()

        if (filters === null){
            console.log("null filters")
        }

        const these_communities = await program.account.community.all(filters);

        console.log("communities: "+JSON.stringify(these_communities));
        
        setCommunities(these_communities);
        setLoadingCommunities(false);     
        return these_communities;
    }

    
    const communityThreadsFilter = communityBase58PublicKey => ({
        memcmp: {
            offset: 8 + // Discriminator
                    1 + //bump
                    32 + // Author public key
                    8 + //Timestamp
                    8, //ends
            bytes: communityBase58PublicKey,
        }
    })
    

    const authorFilter = authorBase58PublicKey => ({
        memcmp: {
            offset: 8 + // Discriminator.
            1, //bump
            bytes: authorBase58PublicKey,
        }
    })

    const genericThreadFilter = nullBase58PublicKey => ({
        memcmp: {
            offset: 8, // Discriminator.
            bytes: new PublicKey(0),
        }
    })
    
    const topicFilter = (topic:string) => ({
        memcmp: {
            offset: 8 + // Discriminator.
                    1 + //bump
                    32 + // Author public key.
                    8 + // Timestamp.
                    8 + //ends
                    32 + // Community
                    32 + // Reply
                    1 + // thread_type
                    1 + // is_encrypted
                    4, // prefix
            bytes: bs58.encode(Buffer.from(topic)),
        }
    })

    const onlyTopicsFilter = replyBase58PublicKey => ({
        memcmp: {
            offset: 8 + // Discriminator.
            1+ //bump
            32 + // Author public key.
            8 + // Timestamp.
            8 + //ends
            32,
            bytes: replyBase58PublicKey,
        }
    })
    
    const fetchThreads = async (filters = [], ignoreSetters:boolean) => {
        setLoadingThreads(true);
        await initWorkspace();
        const { program } = await useWorkspace()

        if (filters === null){
            console.log("null filters")
        }

        const thread = await program.account.thread.all(filters);

        console.log("t: "+JSON.stringify(thread));
        //return thread;
        const mptrd = thread.map((thread:any) => new Thread(thread.publicKey, thread.account))
        mptrd.sort((a:any,b:any) => (a.timestamp < b.timestamp) ? 1 : -1);

        let tcnt = 0;
        for (var x of mptrd){
            if (x.reply.toBase58() !== (new PublicKey(0)).toBase58())
                tcnt++;
        }
        
        if (!ignoreSetters){
            setThreadCount(tcnt);
            setPostCount(mptrd.length);
            setReplyCount(mptrd.length - tcnt);
            setThreads(mptrd);
        }
        setLoadingThreads(false); 
        return mptrd;
    }

    const fetchFilteredCommunityThreads = (community:any) => {
        console.log("filtering by community: "+community.toBase58());
        const filter = [communityThreadsFilter(community.toBase58())]
        fetchThreads(filter, false);
    }

    const fetchFilteredAuthor = (author:any) => {
        //console.log("filtering by author: "+author);
        const filter = [authorFilter(author)]
        fetchThreads(filter, false);
    }

    const fetchFilteredTopic = (topic:any) => {
        const filter = [topicFilter(topic)]
        fetchThreads(filter, false);
    }

    const fetchFilteredThread = (thread:any) => {
        threadFilter(thread);
    }

    React.useEffect(() => { 
        if (urlParams){
            // show unique thread with params
            console.log("with filter: "+urlParams)
            fetchFilteredThread(urlParams)
            //setFilterThread(urlParams);
        } else{
            //???
            setLoading(true);
            fetchCommunities();
            fetchFilteredThread(null);
            //console.log("threads: "+JSON.stringify(thrds))
            setLoading(false);
        }
    }, [urlParams]);

    function ReplyView(props:any){
        const thread = props.thread;
        const allThreads = props.allThreads;

        //console.log("thread: "+JSON.stringify(thread));
        return (
            <>   
                {thread && allThreads && allThreads.map((item:any, key:number) => {
                    return (
                        <>
                        {item?.reply && item.reply.toBase58() === thread.publicKey.toBase58() &&
                            <Timeline
                                sx={{
                                [`& .${timelineOppositeContentClasses.root}`]: {
                                    flex: 0.2,
                                },
                                }}
                            >
                                <TimelineItem>
                                    <TimelineOppositeContent color="textSecondary">
                                        {created_ago(+item?.timestamp)}
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot>
                                            <ConnectedIdentity hidePubKey={true} address={item.author.toBase58()} avatarSize={30} />
                                        </TimelineDot>
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>{item?.content}
                                        <Typography component="span" variant="caption" sx={{color:'gray'}}>
                                            &nbsp;-&nbsp;
                                            {item.author.toBase58()}
                                        </Typography>

                                        <Box sx={{ m: 2 }}>
                                            <Grid container direction="row">
                                                {publicKey && publicKey.toBase58() === item?.author.toBase58() ?
                                                    <Grid item>
                                                        <PostView communities={communities} type={1} thread={item.publicKey} message={item?.content} topic={item?.topic} community={item?.community} metadata={item?.metadata} encrypted={item?.isEncrypted}  reply={item?.reply}/>
                                                        <DeletePost thread={item.publicKey} community={item?.community}/>  
                                                    </Grid>                                                                      
                                                :
                                                    <Grid>
                                                        <PostView communities={communities} type={2} thread={item.publicKey} topic={item?.topic} community={item?.community} encrypted={item?.isEncrypted} reply={item?.reply}/>
                                                    </Grid>
                                                }
                                                
                                            </Grid>
                                        </Box>

                                    </TimelineContent>
                                </TimelineItem>
                            </Timeline>
                            }
                        </>
                    )
                })}
            </>
        )
    }
	
    return (
        <>
            

                        {loading ?
                            <Box 
                                sx={{ width: '100%' }}>
                                <Grid container>
                                    <Grid 
                                        item
                                        sx={{ width: '100%' }}
                                    >
                                        Loading...
                                    </Grid>
                                </Grid>
                                <LinearProgress />
                            </Box>
                        :
                            <>
                                {threads &&
                                    <>

                                      <Box
                                        sx={{ 
                                            p: 1, 
                                            mt: 6,
                                            mb: 3, 
                                            width: '100%',
                                            backgroundColor:'rgba(0,0,0,0.5)',
                                            borderRadius:'24px'
                                        }}
                                        > 
                                            <Grid 
                                                container 
                                                direction="column" 
                                                spacing={2} 
                                                alignItems="center"
                                                justifyContent={'center'}
                                                rowSpacing={8}
                                                sx={{ width: '100%' }}
                                            >
                                                
                                                <Grid 
                                                    item sm={12}
                                                    alignItems="center"
                                                    sx={{ width: '100%' }}
                                                >  
                                            
                                                    <Grid container direction="row">
                                                        <Grid item xs>
                                                            <Typography variant='h5' sx={{ml:1}}>
                                                                {threadCount} threads / {replyCount} replies / {postCount} total posts
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item>

                                                            <CommunityView type={0} ml={1} />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        
                                        
                                        <List sx={{ width: '100%' }}>
                                        
                                        {communities && communities.map((community:any,key:number) => {
                                            return (
                                                <>
                                                    <ButtonGroup sx={{mr:2}}>
                                                        <Button variant="outlined" sx={{borderRadius:'17px',color:'white',textTransform:'none'}}onClick={() => 
                                                            {/*fetchFilteredCommunity(community.publicKey, community.account.mint, community.account.owner)*/
                                                            fetchFilteredCommunityThreads(community.publicKey)
                                                            }}>
                                                            <HubIcon sx={{mr:1}} /><Typography sx={{}}>{community.account.title}</Typography>
                                                        </Button>
                                                        
                                                        {publicKey && community.account.owner.toBase58() === publicKey.toBase58() &&
                                                            <DeleteCommunity community={community.publicKey}/> 
                                                        }
                                                    </ButtonGroup>
                                                </>
                                            );
                                        })}

                                            <Box
                                                sx={{ 
                                                    p: 1, 
                                                    mt: 6,
                                                    mb: 3, 
                                                    width: '100%',
                                                    backgroundColor:'rgba(0,0,0,0.5)',
                                                    borderRadius:'24px'
                                                }}
                                            > 
                                                <Grid 
                                                    container 
                                                    direction="column" 
                                                    spacing={2} 
                                                    alignItems="center"
                                                    justifyContent={'center'}
                                                    rowSpacing={8}
                                                    sx={{ width: '100%' }}
                                                >
                                                    
                                                    <Grid 
                                                        item sm={12}
                                                        alignItems="center"
                                                        sx={{ width: '100%' }}
                                                    >  

                                                        <Grid container direction="row">
                                                            <Grid item xs>
                                                            </Grid>
                                                            <Grid item>
                                                                <Button 
                                                                    variant='outlined'
                                                                    disabled={loadingThreads}
                                                                    onClick={() => {fetchThreads(null, false)}}
                                                                    sx={{borderRadius:'17px', mr:1,color:'white'}}
                                                                >
                                                                    {loadingThreads ?
                                                                        <>loading...</>
                                                                    :
                                                                        <RefreshIcon />
                                                                    }
                                                                    
                                                                </Button>
                                                                <PostView type={0} communities={communities} />
                                                            </Grid>
                                                        </Grid>

                                                        {threads.map((item:any, key:number) => {
                                                            
                                                            return (
                                                                <>
                                                                {key > 0 &&
                                                                    <></>
                                                                }
                                                                
                                                                {item?.reply && item?.reply.toBase58() !== new PublicKey(0).toBase58() ?
                                                                    <></>
                                                                :
                                                                    <ListItem alignItems="flex-start" key={key}>
                                                                        <Box sx={{ width: '100%', background: 'linear-gradient(to right, #111111, rgba(0,0,0,0.5))', boxShadow:'1px 1px 2px black', borderRadius:'17px' }}>
                                                                            
                                                                            <Box sx={{ my: 1, mx: 1 }}>
                                                                                <Grid container>
                                                                                    <Grid item xs>
                                                                                        <Button sx={{color:'white',textTransform:'none',borderRadius:'17px'}} size='large' onClick={() => {fetchFilteredAuthor(item?.author.toBase58())}}>
                                                                                            {item?.author.toBase58() ?
                                                                                                <ConnectedIdentity address={item.author.toBase58()} avatarSize={60} />
                                                                                            :
                                                                                                <>-NAN-</>
                                                                                            }
                                                                                        </Button>
                                                                                    </Grid>
                                                                                    <Grid item>
                                                                                        <Grid container>
                                                                                            <Button variant="contained" sx={{borderRadius:'17px',background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.5))',color:'black',textTransform:'none',mr:2}}onClick={() => {fetchFilteredTopic(item?.topic)}}>
                                                                                                <Typography variant='subtitle1' sx={{}}>#{item?.topic}</Typography>
                                                                                            </Button>

                                                                                            <SocialVotes address={item.publicKey.toBase58()} />
                                                                                        </Grid>

                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Box>
                                                                            
                                                                            <Divider variant="middle" />
                                                                            
                                                                            <br/>
                                                                            <Box sx={{ m: 2 }}>
                                                                                <Typography variant="h5" component='div'>
                                                                                    
                                                                                    {item?.reply && item?.reply.toBase58() !== new PublicKey(0).toBase58() &&
                                                                                        <Typography component='div' variant="caption"><ReplyIcon fontSize='small' sx={{color:'rgba:(255,255,255,0.5)'}} /> REPLYING TO: {item.reply.toBase58()}</Typography>
                                                                                    }

                                                                                    {/* make a fetch reply object */}
                                                                                    {item?.content} 
                                                                                    <Typography component="span" variant="h6" sx={{color:'gray'}}>
                                                                                    &nbsp;-&nbsp;{created_ago(+item?.timestamp)}
                                                                                    </Typography>
                                                                                </Typography>
                                                                            </Box>

                                                                            {/*
                                                                            <Button onClick={() => {fetchFilteredCommunity(item?.community.toBase58())}}>{item.community.toBase58()}</Button>
                                                                            {item?.threadType}
                                                                            {item?.metadata}
                                                                            {item?.isEncrypted}
                                                                            {item.publicKey}
                                                                            */}

                                                                            <br/>
                                                                            <Box sx={{ m: 2 }}>
                                                                                <Grid container direction="row">
                                                                                    <Grid item xs>
                                                                                        <ShareSocialURL url={'https://grape-eve.vercel.app/'+item.publicKey.toBase58()} title={`Topic: ${item?.topic}`} />
                                                                                    </Grid>
                                                                                    
                                                                                    {publicKey && publicKey.toBase58() === item?.author.toBase58() ?
                                                                                        <Grid item>
                                                                                            <PostView communities={communities} type={2} thread={item.publicKey} topic={item?.topic} community={item?.community} encrypted={item?.isEncrypted} mr={1} reply={item?.reply}/>
                                                                                            <PostView communities={communities} type={1} thread={item.publicKey} message={item?.content} topic={item?.topic} community={item?.community} metadata={item?.metadata} encrypted={item?.isEncrypted}  reply={item?.reply}/>
                                                                                            <DeletePost thread={item.publicKey} community={item?.community}/>  
                                                                                        </Grid>                                                                      
                                                                                    :
                                                                                        <Grid>
                                                                                        <PostView communities={communities} type={2} thread={item.publicKey} topic={item?.topic} community={item?.community} encrypted={item?.isEncrypted} reply={item?.reply}/>
                                                                                        </Grid>
                                                                                    }
                                                                                    
                                                                                </Grid>
                                                                            </Box>
                                                                            
                                                                            <ReplyView allThreads={threads} thread={item} />
                                                                    
                                                                        </Box>

                                                                    </ListItem>
                                                                }
                                                                </>
                                                            )
                                                        })}
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </List>
                                    </>
                                }
                            </>
                        }
        </>
	)
}
