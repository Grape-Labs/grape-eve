import React, { useEffect, useCallback, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
//import { ShdwDrive } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
import { Schema, deserializeUnchecked, deserialize } from "borsh";
import { TokenAmount } from '../utils/grapeTools/safe-math';
import { GrapeEve, IDL } from '../../types/grape_eve';
import tidl from '../../idl/grape_eve.json';

import bs58 from 'bs58';
import BN from 'bn.js';
import LitJsSdk from "lit-js-sdk";

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
//import { GrapeEve, IDL } from "../../../target/types/grape_eve"
import dayjs from "dayjs"
var relativeTime = require('dayjs/plugin/relativeTime')

import { Thread } from '../models'

import { 
    Provider, Program, web3 
} from '@project-serum/anchor'

import { useSnackbar } from 'notistack';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletConnectButton } from "@solana/wallet-adapter-material-ui";

import { useTranslation } from 'react-i18next';

import moment from 'moment';

import { 
    GRAPE_RPC_ENDPOINT
} from '../utils/grapeTools/constants';

import { styled } from '@mui/material/styles';
import {
    Box,
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
    LinearProgress
} from '@mui/material';

import GrapeIcon from "../components/static/GrapeIcon";
import SolanaIcon from "../components/static/SolIcon";
import SolCurrencyIcon from '../components/static/SolCurrencyIcon';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';

import { buffer } from "node:stream/consumers";
import { responsiveProperty } from "@mui/material/styles/cssUtils";

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

    //const client = new LitJsSdk.LitNodeClient();
	const wallet = useWallet();
    const {publicKey} = useWallet();
    const [loading, setLoading] = React.useState(false);
    const [loadingThreads, setLoadingThreads] = React.useState(false);
    
    const {handlekey} = useParams<{ handlekey: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlParams = searchParams.get("storage") || searchParams.get("address") || handlekey;
    const [threads, setThreads] = React.useState(null);
    
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
        const clusterUrl = 'https://api.devnet.solana.com'; //'https://ssc-dao.genesysgo.net/';//process.env.VUE_APP_CLUSTER_URL
        const grapeEveId = "2rbW644hAFC43trjcsbrpPQjGvUHz6q3k4D3kZYSZigB";
        const programID = new PublicKey(grapeEveId);
        
        const connection = new Connection(clusterUrl)

        async function getProvider() {
            /* create the provider and return it to the caller */
            /* network set to local network for now */
            const connection = new Connection(clusterUrl);
            
            //const provider = new AnchorProvider(
            const provider = new Provider(
                    connection, wallet, {
                commitment: "processed"
            },
            );
            return provider;
        }

        const provider = await getProvider()
        const program = new Program<GrapeEve>(IDL, programID, provider);
        //const program = new Program(tidl, programID, provider);
        
        const litclient = new LitJsSdk.LitNodeClient();
        const chain = 'solana'

        //await litclient.connect()
        //window.litNodeClient = litclient

        console.log( "threads: + "+JSON.stringify(program.account.thread.all([]) ));

        workspace = {
            wallet,
            connection,
            provider,
            program,
            litclient
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

/*

    const DISCRIMINATOR_LENGTH: usize = 8;
    const PUBLIC_KEY_LENGTH: usize = 32;
    const TIMESTAMP_LENGTH: usize = 8;
    const COMMUNITY_LENGTH: usize = 32 + 1;
    const REPLY_KEY_LENGTH: usize = 32 + 1;
    const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
    const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
    const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.
    const METADATA_LENGTH: usize = 280 * 4;
    const COMMUNITYTYPE_LENGTH: usize = 1;
    const ISENCRYPTED_LENGTH: usize = 1;

        DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + COMMUNITY_LENGTH // Com.
        + REPLY_KEY_LENGTH; // Reply
        + COMMUNITYTYPE_LENGTH //
        + ISENCRYPTED_LENGTH // additional fields
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH // Content.
        + STRING_LENGTH_PREFIX + METADATA_LENGTH
*/

    const communityFilter = communityBase58PublicKey => ([
        {
            memcmp: {
                offset: 8 + // Discriminator.
                        32 + // Author
                        8, // Timestamp  
                bytes: bs58.encode((new BN(1, 'le')).toArray()),
            }
        },
        {
            memcmp: {
                offset: 8 + // Discriminator.
                32 + // Author
                8 + // Timestamp
                1, //+ // community
                bytes: communityBase58PublicKey,
            }
        }
    ])

    const authorFilter = authorBase58PublicKey => ({
        memcmp: {
            offset: 8, // Discriminator.
            bytes: authorBase58PublicKey,
        }
    })
    
    const topicFilter = (topic:string) => ({
        memcmp: {
            offset: 8 + // Discriminator.
                    32 + // Author public key.
                    8 + // Timestamp.
                    32 + 1 + // Community
                    32 + 1 + // Reply
                    1 + //
                    1 + // 
                    4, // prefix
            bytes: bs58.encode(Buffer.from(topic)),
        }
    })

    const fetchThreads = async (filters = []) => {
        setLoadingThreads(true);
        await initWorkspace();
        const { program } = await useWorkspace()

        //const threadlen = await program.account.thread.all.length
        const thread = await program.account.thread.all(filters);

        console.log("t: "+JSON.stringify(thread));
        //return thread;
        const mptrd = thread.map((thread:any) => new Thread(thread.publicKey, thread.account))
        mptrd.sort((a:any,b:any) => (a.timestamp < b.timestamp) ? 1 : -1);
        setThreads(mptrd);
        setLoadingThreads(false);     
        return mptrd;
    }

    const newPost = async (topic:string, content:string, metadata: string, threadType: number, encrypted: number, community:PublicKey, reply: PublicKey ) => {
        await initWorkspace();
        const { wallet, provider, program } = useWorkspace()
        
        const thread = web3.Keypair.generate()
        //console.log("posting: "+topic+" - "+content+" - "+metadata+" - "+community+" - "+threadType+" - "+encrypted+" - "+(reply))
        try{
            enqueueSnackbar(`Preparing to create a new post`,{ variant: 'info' });
            
            console.log("community: "+(community && community.toBase58()))

            const signedTransaction = await program.rpc.sendPost(topic, content, metadata, threadType, encrypted, community, reply, {
                accounts: {
                    author: publicKey,
                    thread: thread.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [thread]
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
            enqueueSnackbar(`Post created`,{ variant: 'success', action:snackaction });
            
            // do a refresh this is not efficient we should simply 
            // do a dynamic push/popup on the object and avoid the additional rpc call
            fetchThreads();
        } catch(e:any){
            closeSnackbar();
            enqueueSnackbar(e.message ? `${e.name}: ${e.message}` : e.name, { variant: 'error' });
            //enqueueSnackbar(`Error: ${e}`,{ variant: 'error' });
            console.log("Error: "+e);
            //console.log("Error: "+JSON.stringify(e));
        } 
    }

    const editPost = async (thread: PublicKey, topic:string, content:string, community:PublicKey, encrypted:number) => {
        await initWorkspace();
        const { wallet, provider, program } = useWorkspace()
        try{
            //const thread = web3.Keypair.generate()
            
            enqueueSnackbar(`Preparing to edit post`,{ variant: 'info' });
            //enqueueSnackbar(`Preparing to edit post ${publicKey.toBase58()} from ${thread.toBase58()})`,{ variant: 'info' });
            //enqueueSnackbar(`${topic} - Message ${content})`,{ variant: 'info' });
            
            const signedTransaction = await program.rpc.updatePost(topic, content, {
                accounts: {
                    author: publicKey,
                    thread: thread,
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
            enqueueSnackbar(`Edit complete!`,{ variant: 'success', action:snackaction });
            
            // do a refresh this is not efficient we should simply 
            // do a dynamic push/popup on the object and avoid the additional rpc call
            fetchThreads();
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
        
        const deletePost = async () => {
            await initWorkspace();
            const { wallet, provider, program } = useWorkspace()
    
            console.log("deleting: "+thread.toBase58() + " from: "+publicKey.toBase58());

            try{
                enqueueSnackbar(`Preparing to delete post`,{ variant: 'info' });
                const signedTransaction = await program.rpc.deletePost({
                    accounts: {
                        author: publicKey,
                        thread: thread,
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
                enqueueSnackbar(`Post created`,{ variant: 'success', action:snackaction });
            
                console.log("signature: "+JSON.stringify(signedTransaction));
                // do a refresh this is not efficient we should simply 
                // do a dynamic push/popup on the object and avoid the additional rpc call
                fetchThreads();
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
    
    function PostView(props:any){
        const type = props?.type;
        const thread = props?.thread;
        const [openPreviewDialog, setOpenPreviewDialog] = React.useState(false);
        const [encrypted, setEncrypted] = React.useState(props?.encrypted || 0);
        const [message, setMessage] = React.useState(props?.message || null);
        const [topic, setTopic] = React.useState(props?.topic || null);
        const [community, setCommunity] = React.useState((props?.community && new PublicKey(props.community)) || new PublicKey(0));
        const [reply, setReply] = React.useState((type=== 2 && props?.thread && new PublicKey(props.thread)) || new PublicKey(0));
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
                const thisthread = await newPost(topic, message, metadata, 1, encrypted, community, reply);
                console.log("New: "+JSON.stringify(thisthread));
            } else if (type === 1){
                const thisthread = await editPost(thread, topic, message, community, encrypted);
                console.log("Edit: "+JSON.stringify(thisthread));
            } else if (type === 2){
                const metadata = '';
                console.log("reply: "+reply.toBase58())
                const thisthread = await newPost(topic, message, metadata, 1, encrypted, community, reply);
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
                    sx={{borderRadius:'17px'}}
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
                            <FormControl fullWidth>
                                <TextField
                                    id="filled-multiline-static"
                                    label="Start a discussion"
                                    multiline
                                    rows={4}
                                    value={message}
                                    onChange={(e: any) => {
                                        setMessage(e.target.value)}
                                    }
                                    />
                                <Typography>{280 - (message?.length | 0)} left</Typography>
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField 
                                    fullWidth 
                                    label="Topic" 
                                    id="fullWidth" 
                                    value={topic}
                                    onChange={(e: any) => {
                                        setTopic(e.target.value)}
                                    }/>
                            </FormControl>
                            <FormControlLabel control={<Switch defaultChecked />} label="Encrypted" />
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Community</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Community"
                                    value={community}
                                    onChange={(e: any) => {
                                        setCommunity(new PublicKey(e.target.value))}
                                    }
                                >
                                    <MenuItem value={`8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA`}>Grape</MenuItem>
                                    <MenuItem value={`So11111111111111111111111111111111111111112`}>Solana</MenuItem>
                                </Select>
                            </FormControl>

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

    const fetchFilteredAuthor = (author:any) => {
        const filter = [authorFilter(author)]
        fetchThreads(filter);
    }

    const fetchFilteredThreads = (topic:any) => {
        const filter = [topicFilter(topic)]
        fetchThreads(filter);
    }

    const fetchFilteredCommunity = (community:any) => {
        //console.log("with: "+community)
        const filter = communityFilter(community)
        fetchThreads(filter);
    }

    useEffect(() => {
		(async () => {
            //if (urlParams){
                //console.log("PARAMS: "+urlParams);

                setLoading(true);
                await fetchThreads(null);
                //console.log("threads: "+JSON.stringify(thrds))
                setLoading(false);

            /*
            } else if (wallet?.publicKey) {
                setLoading(true);
                // do some magic here...
                setLoading(false);
			}*/

		})();
	}, [])
	
    return (
        <>
            
            <Box
                sx={{ 
                    p: 1, 
                    mt: 6,
                    mb: 3, 
                    width: '100%',
                    background: '#13151C',
                    borderRadius: '24px'
                }}
            > 
                <Grid 
                    container 
                    direction="column" 
                    spacing={2} 
                    alignItems="center"
                    justifyContent={'center'}
                    rowSpacing={8}
                >
                    
                    <Grid 
                        item sm={12}
                        alignItems="center"
                    >

                        {loading ?
                            <Box sx={{ width: '100%' }}>
                                Loading...
                                <LinearProgress />
                            </Box>
                        :
                            <>
                                {threads &&
                                    <>
                                        <Typography>
                                            
                                            <Grid container direction="row">
                                                <Grid item xs={6}>
                                                    <Typography sx={{mr:1}}>
                                                        {threads.length} thread posts
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <PostView type={0} />
                                                    <Button 
                                                        variant='outlined'
                                                        disabled={loadingThreads}
                                                        onClick={() => {fetchThreads()}}
                                                        sx={{borderRadius:'17px', ml:1}}
                                                    >
                                                        {loadingThreads ?
                                                            <>loading...</>
                                                        :
                                                            <RefreshIcon />
                                                        }
                                                        
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Typography>
                                        
                                        <List sx={{ width: '100%' }}>
                                        
                                        {threads.map((item:any, key:number) => {
                                            return (
                                                <ListItem alignItems="flex-start" key={key}>
                                                    
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <Jazzicon diameter={40} seed={jsNumberForAddress(item?.author.toBase58())} />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <>
                                                                <Typography variant="h6">
                                                                    {item?.content}
                                                                </Typography>
                                                            </>
                                                            }
                                                        secondary={
                                                            <React.Fragment>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                {created_ago(+item?.timestamp)}
                                                            </Typography>
                                                            &nbsp;-&nbsp;
                                                            <Button onClick={() => {fetchFilteredAuthor(item?.author.toBase58())}}>{item?.author.toBase58()}</Button>

                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Topic: <Button onClick={() => {fetchFilteredThreads(item?.topic)}}>{item?.topic}</Button>
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    {item?.community && <>Community:<Button onClick={() => {fetchFilteredCommunity(item?.community.toBase58())}}>{item.community.toBase58()}</Button></>} 
                                                                    Type: {item?.threadType}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    {item?.reply && <>Reply: {item.reply.toBase58()}</>} 
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Metadata: {item?.metadata}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Encrypted: {item?.isEncrypted}
                                                                </Typography>
                                                                {publicKey && publicKey.toBase58() === item?.author.toBase58() ?
                                                                    <>
                                                                        <PostView type={1} thread={item.publicKey} message={item?.content} topic={item?.topic} community={item?.community} metadata={item?.metadata} encrypted={item?.isEncrypted}  />
                                                                        <DeletePost thread={item.publicKey}/>                                                                        
                                                                    </>
                                                                :
                                                                    <>
                                                                        <PostView type={2} thread={item.publicKey} topic={item?.topic} community={item?.community} encrypted={item?.isEncrypted} />
                                                                    </>
                                                                }
                                                            </React.Fragment>
                                                        }
                                                    />
                                                </ListItem>
                                            )
                                        })}
                                        </List>
                                    </>
                                }
                            </>
                        }
                    </Grid>
                </Grid>
            </Box>
        </>
	)
}